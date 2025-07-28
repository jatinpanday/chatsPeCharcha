import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:8080",
      "http://localhost:3000",
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true,
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    socket.join(userId); // Join a room with userId
  }

  // Notify all clients about online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle sending and receiving messages
  socket.on("sendMessage", ({ senderId, receiverId, message, tempId }, callback) => {
    try {
      if (!senderId || !receiverId || !message) {
        throw new Error('Missing required message fields');
      }

      const receiverSocketId = getReceiverSocketId(receiverId);
      
      // Generate a server-side message ID
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create message object
      const messageObj = {
        _id: messageId,
        senderId,
        receiverId,
        content: message,
        timestamp: new Date().toISOString(),
        status: 'delivered'
      };
      
      // Send message to the specific receiver if online
      if (receiverSocketId) {
        const receiveMessage = {
          ...messageObj,
          status: 'delivered' // Ensure status is set to delivered
        };
        console.log('Sending receiveMessage to receiver:', { 
          receiverSocketId, 
          message: receiveMessage 
        });
        io.to(receiverSocketId).emit("receiveMessage", receiveMessage);
        
        // Update sender that message was delivered
        const senderSocketId = getReceiverSocketId(senderId);
        if (senderSocketId) {
          const statusUpdate = {
            messageId: messageObj._id,
            status: 'delivered',
            tempId: messageObj.tempId
          };
          console.log('Sending messageStatusUpdate to sender:', { 
            senderSocketId, 
            update: statusUpdate 
          });
          io.to(senderSocketId).emit("messageStatusUpdate", statusUpdate);
        }
      }
      
      // Also send back to sender for confirmation
      const senderSocketId = getReceiverSocketId(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageSent", {
          ...messageObj,
          tempId // Include the temporary ID for client-side reconciliation
        });
      }
      
      // Acknowledge receipt of the message
      if (typeof callback === 'function') {
        callback({
          success: true,
          messageId,
          tempId
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (typeof callback === 'function') {
        callback({
          success: false,
          error: error.message || 'Failed to send message'
        });
      }
    }
  });

  // Handle typing indicators
  socket.on("typing", ({ receiverId, isTyping }) => {
    try {
      const senderId = socket.handshake.query.userId;
      
      console.log('Handling typing event:', { 
        senderId, 
        receiverId, 
        isTyping,
        socketId: socket.id
      });
      
      // Don't process if sender and receiver are the same
      if (senderId === receiverId) {
        console.log('Ignoring typing event: sender and receiver are the same');
        return;
      }
      
      const receiverSocketId = getReceiverSocketId(receiverId);
      console.log('Receiver socket ID for', receiverId, ':', receiverSocketId);
      
      // Always process typing stop events, even if receiver is offline
      if (!receiverSocketId && isTyping) {
        console.log('Receiver is offline, not sending typing start event');
        return;
      }
      
      // Create the typing event
      const typingEvent = { 
        senderId,
        isTyping,
        receiverId,
        timestamp: new Date().toISOString()
      };
      
      console.log('Sending typing event to receiver:', typingEvent);
      
      // Send the typing event to the specific receiver
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit("userTyping", typingEvent);
      } else if (!isTyping) {
        // If this is a typing stop event and receiver is offline, still process it
        // to clear any existing typing states
        socket.emit("userTyping", typingEvent);
      }
      
    } catch (error) {
      console.error('Error handling typing event:', error);
    }
  });

  // Handle message read receipts
  socket.on("messageSeen", ({ messageId, receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageSeen", { messageId });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });
});

export { io, app, server };