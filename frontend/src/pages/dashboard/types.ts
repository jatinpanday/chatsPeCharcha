export interface User {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
}

export interface FriendRequest {
  _id: string;
  sender: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Chat {
  _id: string;
  fullName: string;
  profilePic?: string;
  lastMessage?: string;
  unreadCount?: number;
  online?: boolean;
  timestamp?: string;
}

export interface Message {
  id?: string; // For backward compatibility
  _id?: string; // Server-generated ID
  text?: string; // For backward compatibility
  content?: string; // New message content field
  timestamp: string;
  isSent?: boolean; // For backward compatibility
  sender?: string; // For backward compatibility
  senderId?: string; // Sender's user ID
  recipientId?: string; // Recipient's user ID
  tempId?: string; // Used for optimistic updates before server confirmation
  failed?: boolean; // Indicates if the message failed to send
  status?: 'sending' | 'sent' | 'delivered' | 'seen' | 'failed'; // Message status
  isRead?: boolean; // Whether the message has been read by the recipient
}
