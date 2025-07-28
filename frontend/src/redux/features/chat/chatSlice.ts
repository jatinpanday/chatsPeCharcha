import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  _id?: string;
  id?: string;
  content: string;
  senderId: string;
  recipientId: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'seen' | 'failed';
  isRead?: boolean;
  tempId?: string;
  failed?: boolean;
}

interface ConversationMessages {
  [conversationId: string]: Message[];
}

interface ChatState {
  conversations: {
    [conversationId: string]: {
      messages: Message[];
      unreadCount: number;
    };
  };
  onlineUsers: string[];
  typingUsers: { [userId: string]: boolean };
  activeConversation: string | null;
}

const initialState: ChatState = {
  conversations: {},
  onlineUsers: [],
  typingUsers: {},
  activeConversation: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversation = action.payload;
      // Mark messages as read when conversation is opened
      if (action.payload && state.conversations[action.payload]) {
        state.conversations[action.payload].unreadCount = 0;
      }
    },
    
    addMessage: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
      const { conversationId, message } = action.payload;
      
      if (!state.conversations[conversationId]) {
        state.conversations[conversationId] = {
          messages: [],
          unreadCount: 0,
        };
      }
      
      // Check if message already exists (for updates)
      const existingIndex = state.conversations[conversationId].messages.findIndex(
        m => m._id === message._id || (message.tempId && m.tempId === message.tempId)
      );
      
      if (existingIndex >= 0) {
        // Update existing message
        state.conversations[conversationId].messages[existingIndex] = {
          ...state.conversations[conversationId].messages[existingIndex],
          ...message,
          // Preserve the original ID if updating a temporary message
          _id: state.conversations[conversationId].messages[existingIndex]._id
        };
      } else {
        // Add new message
        state.conversations[conversationId].messages.push(message);
      }
      
      // Sort messages by timestamp
      state.conversations[conversationId].messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      // Update unread count if the message is not from the current user and not in the active conversation
      if (state.activeConversation !== conversationId && 
          message.senderId !== state.activeConversation) {
        state.conversations[conversationId].unreadCount += 1;
      }
    },
    
    updateMessageStatus: (state, action: PayloadAction<{ messageId: string; status: 'sending' | 'sent' | 'delivered' | 'seen' | 'failed' }>) => {
      const { messageId, status } = action.payload;
      
      // Find and update the message in all conversations
      Object.values(state.conversations).forEach(conversation => {
        const messageIndex = conversation.messages.findIndex(
          m => m._id === messageId || m.tempId === messageId
        );
        
        if (messageIndex >= 0) {
          const message = conversation.messages[messageIndex];
          // Update status and preserve other properties
          conversation.messages[messageIndex] = {
            ...message,
            status,
            ...(status === 'seen' ? { isRead: true } : {})
          };
        }
      });
    },
    
    setTypingStatus: (state, action: PayloadAction<{ userId: string; isTyping: boolean }>) => {
      const { userId, isTyping } = action.payload;
      if (isTyping) {
        state.typingUsers[userId] = true;
      } else {
        delete state.typingUsers[userId];
      }
    },
    
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
    
    addOnlineUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      if (!state.onlineUsers.includes(userId)) {
        state.onlineUsers.push(userId);
      }
    },
    
    removeOnlineUser: (state, action: PayloadAction<string>) => {
      state.onlineUsers = state.onlineUsers.filter(id => id !== action.payload);
    },
    
    clearChatState: () => initialState,
  },
});

// Export actions
export const {
  addMessage,
  updateMessageStatus,
  setTypingStatus,
  setOnlineUsers,
  addOnlineUser,
  removeOnlineUser,
  setActiveConversation,
  clearChatState,
} = chatSlice.actions;

// Selectors
export const selectMessages = (state: { chat: ChatState }, conversationId: string) => {
  if (!state?.chat?.conversations || !conversationId) return [];
  return state.chat.conversations[conversationId]?.messages || [];
};

export const selectIsTyping = (state: { chat: ChatState }, userId: string) => 
  state.chat.typingUsers[userId] || false;

export const selectOnlineUsers = (state: { chat: ChatState }) => 
  state.chat.onlineUsers;

export const selectUnreadCount = (state: { chat: ChatState }, conversationId: string) => 
  state.chat.conversations[conversationId]?.unreadCount || 0;

export const selectActiveConversation = (state: { chat: ChatState }) => 
  state.chat.activeConversation;

export default chatSlice.reducer;
