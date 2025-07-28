import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  messages: {},
  onlineUsers: [],
  typingUsers: {},
  activeConversation: null,
  unreadCounts: {},
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action) => {
      state.activeConversation = action.payload;
      // Mark messages as read when conversation is opened
      if (action.payload) {
        state.unreadCounts[action.payload] = 0;
      }
    },
    addMessage: (state, action) => {
      try {
        console.log('addMessage action received:', action);
        
        // Extract data from payload (handling both direct props and nested message object)
        const messageData = action.payload.message || action.payload;
        const { senderId, receiverId, content, timestamp, _id, status, tempId } = messageData;
        
        if (!senderId || !receiverId) {
          console.error('Missing senderId or receiverId in message:', messageData);
          return;
        }
        
        const conversationId = [senderId, receiverId].sort().join('_');
        console.log('Processing message for conversation:', conversationId, messageData);
        
        if (!state.messages[conversationId]) {
          console.log('Creating new conversation in state:', conversationId);
          state.messages[conversationId] = [];
        }

        // Use the provided ID or generate a new one
        const messageId = _id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Check if message with this ID or content already exists in the conversation
        const existingMessageIndex = state.messages[conversationId].findIndex(
          msg => msg._id === messageId || 
                (msg.senderId === senderId && 
                 msg.content === (content || messageData.message) && 
                 Math.abs(new Date(msg.timestamp).getTime() - new Date(timestamp || Date.now()).getTime()) < 10000)
        );

        const newMessage = {
          _id: messageId,
          ...messageData,
          senderId,
          receiverId,
          content: content || messageData.message || '',
          status: status || 'sending',
          timestamp: timestamp || new Date().toISOString(),
          tempId: tempId || false
        };

        if (existingMessageIndex !== -1) {
          // Update existing message
          console.log('Updating existing message:', messageId);
          state.messages[conversationId][existingMessageIndex] = {
            ...state.messages[conversationId][existingMessageIndex],
            ...newMessage
          };
        } else {
          // Add new message
          console.log('Adding new message to state:', newMessage);
          state.messages[conversationId] = [...state.messages[conversationId], newMessage];
        }
        
        // Update unread count if the message is not from the active conversation
        if (state.activeConversation !== conversationId && senderId !== receiverId) {
          state.unreadCounts[conversationId] = (state.unreadCounts[conversationId] || 0) + 1;
          console.log('Updated unread count for conversation:', conversationId, state.unreadCounts[conversationId]);
        }
      } catch (error) {
        console.error('Error in addMessage reducer:', error);
      }
    },
    setTypingStatus: (state, action) => {
      const { userId, isTyping } = action.payload;
      if (isTyping) {
        state.typingUsers[userId] = true;
      } else {
        delete state.typingUsers[userId];
      }
    },
    updateMessageStatus: (state, action) => {
      const { messageId, status } = action.payload;
      
      // Find and update the message status in all conversations
      Object.keys(state.messages).forEach(conversationId => {
        const messageIndex = state.messages[conversationId].findIndex(
          msg => msg._id === messageId || msg.tempId === messageId
        );
        
        if (messageIndex !== -1) {
          state.messages[conversationId][messageIndex].status = status;
        }
      });
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    addOnlineUser: (state, action) => {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },
    removeOnlineUser: (state, action) => {
      state.onlineUsers = state.onlineUsers.filter(id => id !== action.payload);
    },
    clearChatState: () => initialState,
  },
});

export const {
  addMessage,
  setTypingStatus,
  updateMessageStatus,
  setActiveConversation,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  clearChatState,
} = chatSlice.actions;

export default chatSlice.reducer;

// Selectors
export const selectMessages = (state, conversationId) => {
  if (!state?.chat?.messages || !conversationId) return [];
  return state.chat.messages[conversationId] || [];
};

export const selectIsTyping = (state, userId) => 
  state?.chat?.typingUsers?.[userId] || false;

export const selectOnlineUsers = (state) => 
  state?.chat?.onlineUsers || [];

export const selectUnreadCount = (state, conversationId) =>
  state?.chat?.unreadCounts?.[conversationId] || 0;

export const selectActiveConversation = (state) =>
  state?.chat?.activeConversation || null;
