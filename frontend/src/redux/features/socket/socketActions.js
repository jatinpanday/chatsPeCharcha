// src/features/socket/socketActions.js
export const connectSocket = () => ({ type: "socket/connect" });
export const disconnectSocket = () => ({ type: "socket/disconnect" });

export const sendMessage = (receiverId, message) => ({
  type: "socket/sendMessage",
  payload: { receiverId, message },
});

export const setTypingStatus = (receiverId, isTyping) => ({
  type: "socket/typing",
  payload: { receiverId, isTyping },
});

export const markMessageAsSeen = (messageId, receiverId) => ({
  type: "socket/messageSeen",
  payload: { messageId, receiverId },
});

// Helper function to emit custom events if needed
export const emitSocketEvent = (event, data) => ({
  type: `socket/${event}`,
  payload: data,
});
