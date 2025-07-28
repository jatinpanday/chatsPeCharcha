// src/middleware/socketMiddleware.js
import { io } from "socket.io-client";
import { setUser, logout } from "../features/user/userSlice";
import {
  addMessage,
  setTypingStatus,
  updateMessageStatus,
  addOnlineUser,
  removeOnlineUser,
  setOnlineUsers
} from "../features/chat/chatSlice";

let socket;

const socketMiddleware = (storeAPI) => (next) => (action) => {
  const { dispatch, getState } = storeAPI;
  const state = getState();
  const { user } = state.user;

  switch (action.type) {
    case "socket/connect": {
      const token = state.user.token;
      if (!socket && token) {
        socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5001", {
          auth: { token },
          query: { userId: user?._id },
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        // Connection events
        socket.on("connect", () => {
          console.log("Socket connected:", socket.id);
          window.socket = socket; 

          if (user?._id) {
            socket.emit("join", { userId: user._id });
          }
        });


        socket.on("disconnect", () => {
          console.log("Socket disconnected");
        });

        // Chat events - handles both sent and received messages
        socket.on("receiveMessage", (message) => {
          const { senderId, receiverId } = message;
          const currentUserId = user?._id;
          
          // This event is for both sent and received messages
          // For sent messages: senderId is current user, receiverId is the other user
          // For received messages: senderId is the other user, receiverId is current user
          if (senderId === currentUserId || receiverId === currentUserId) {
            const conversationId = [senderId, receiverId].sort().join('_');
            console.log('Processing message in receiveMessage:', { 
              message, 
              currentUserId, 
              isFromMe: senderId === currentUserId,
              isToMe: receiverId === currentUserId
            });
            
            dispatch(addMessage({
              conversationId,
              message: {
                ...message,
                // Only mark as delivered if it's a received message
                status: receiverId === currentUserId ? 'delivered' : message.status || 'sent'
              }
            }));
          }
        });

        // Handle message sent confirmation from server
        socket.on("messageSent", (message) => {
          console.log('Message sent confirmation received:', message);
          const { tempId, _id, senderId, receiverId, content, timestamp } = message;
          
          // If we have a tempId, update the existing message status
          if (tempId && _id) {
            dispatch(updateMessageStatus({
              messageId: tempId,
              status: 'sent',
              newId: _id
            }));
          } 
          // If no tempId but we have a complete message, add it directly
          else if (senderId && receiverId && content) {
            const conversationId = [senderId, receiverId].sort().join('_');
            console.log('Adding sent message to store:', { message, conversationId });
            dispatch(addMessage({
              conversationId,
              message: {
                ...message,
                status: 'sent',
                timestamp: timestamp || new Date().toISOString()
              }
            }));
          }
        });

        // Handle message status updates (delivered, seen)
        socket.on("messageStatusUpdate", ({ messageId, status, tempId }) => {
          console.log('Message status update received:', { messageId, status, tempId });
          if (messageId || tempId) {
            console.log('Dispatching updateMessageStatus with:', { 
              messageId: messageId || tempId, 
              status,
              newId: messageId 
            });
            dispatch(updateMessageStatus({
              messageId: messageId || tempId,
              status,
              newId: messageId
            }));
          } else {
            console.warn('No messageId or tempId in status update:', { messageId, status, tempId });
          }
        });

        // Handle typing events from other users
        socket.on("userTyping", ({ senderId, isTyping, receiverId }) => {
          console.log('Socket middleware received typing event:', { senderId, isTyping, receiverId });
          // Only process if this typing event is for the current user
          if (receiverId === user?._id) {
            console.log(`Setting typing status for user ${senderId} to ${isTyping}`);
            dispatch(setTypingStatus({ 
              userId: senderId, 
              isTyping 
            }));
            
            // If this is a stop typing event, also clear any pending timeouts
            if (!isTyping) {
              console.log(`Cleared typing status for user ${senderId}`);
            }
          }
        });

        socket.on("messageSeen", ({ messageId }) => {
          dispatch(updateMessageStatus({ messageId, status: 'seen' }));
        });

        // Online users
        socket.on("getOnlineUsers", (onlineUsers) => {
          dispatch(setOnlineUsers(onlineUsers));
        });

        socket.on("userConnected", (userId) => {
          dispatch(addOnlineUser(userId));
        });

        socket.on("userDisconnected", (userId) => {
          dispatch(removeOnlineUser(userId));
        });
      }
      break;
    }

    case "socket/disconnect": {
      if (socket) {
        socket.disconnect();
        socket = null;
        window.socket = null;
      }
      break;
    }


    case "socket/sendMessage": {
      if (socket && socket.connected) {
        const { receiverId, message, tempId } = action.payload;
        
        // Add ack callback to handle message delivery confirmation
        socket.emit("sendMessage", 
          {
            senderId: user?._id,
            receiverId,
            message,
            tempId,
            timestamp: new Date().toISOString()
          },
          (response) => {
            if (response?.success) {
              // Message was successfully received by the server
              storeAPI.dispatch(updateMessageStatus({
                messageId: tempId,
                status: 'sent',
                newId: response.messageId // In case server generated a new ID
              }));
            } else {
              // Handle send failure
              storeAPI.dispatch(updateMessageStatus({
                messageId: tempId,
                status: 'failed'
              }));
              
              console.error('Failed to send message:', response?.error || 'Unknown error');
            }
          }
        );
      } else {
        // If socket is not connected, mark message as failed
        storeAPI.dispatch(updateMessageStatus({
          messageId: action.payload.tempId,
          status: 'failed'
        }));
        
        // Try to reconnect
        if (socket) {
          socket.connect();
        } else {
          // If socket is null, try to initialize a new connection
          storeAPI.dispatch(connectSocket());
        }
      }
      break;
    }

    case "socket/typing": {
      if (socket && socket.connected) {
        const { receiverId, isTyping } = action.payload;
        socket.emit("userTyping", { receiverId, isTyping });
      }
      break;
    }

    case "socket/messageSeen": {
      if (socket && socket.connected) {
        const { messageId, receiverId } = action.payload;
        socket.emit("messageSeen", { messageId, receiverId });
      }
      break;
    }

    case logout.type: {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      break;
    }

    default:
      break;
  }

  return next(action);
};

export default socketMiddleware;
