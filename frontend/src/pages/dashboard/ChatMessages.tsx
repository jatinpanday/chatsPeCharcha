import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, Chat } from "./types";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { updateMessageStatus } from "@/redux/features/chat/chatSlice";
import { useEffect, useRef } from "react";

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  currentChat: Chat | null;
  currentUser: {
    _id: string;
    fullName: string;
    profilePic?: string;
  } | null;
}

export function ChatMessages({ 
  messages, 
  isTyping, 
  currentChat, 
  currentUser 
}: ChatMessagesProps) {
  const dispatch = useDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentConversationId = currentChat?._id;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Mark messages as seen when scrolled to bottom
    if (messages.length > 0 && currentUser?._id && currentConversationId) {
      const lastMessage = messages[messages.length - 1];
      
      // Only mark as seen if the message is from the other user and not already seen
      if (lastMessage.senderId !== currentUser._id && lastMessage.status !== 'seen') {
        // Update local state optimistically
        dispatch(updateMessageStatus({
          messageId: lastMessage._id,
          status: 'seen'
        }));
        
        // Notify the sender that their message was seen
        if ((window as any).socket) {
          (window as any).socket.emit('messageSeen', {
            messageId: lastMessage._id,
            senderId: lastMessage.senderId,
            receiverId: currentUser._id
          });
        }
      }
    }
  }, [messages, currentUser, currentConversationId, dispatch]);

  return (
    <ScrollArea className="flex-1 w-full">
      <div className="flex flex-col h-full p-4 space-y-3 bg-muted">
        {messages.map((message) => {
          console.log(message,"message status");
          
          // Determine if the message is from the current user
          const isCurrentUser = message.senderId === currentUser?._id || message.isSent;
          const senderId = message.senderId || (message.sender as any)?._id || message.sender;
          const isFromCurrentUser = senderId === currentUser?._id;
          const messageContent = message.content || message.text || '';
          
          return (
            <div
              key={message._id || message.id || message.tempId}
              className={cn(
                "flex w-full",
                isFromCurrentUser ? "justify-end" : "justify-start"
              )}
            >
              <div className="flex max-w-[80%] gap-2">
                {!isFromCurrentUser && currentChat?.profilePic && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <img 
                      src={currentChat.profilePic} 
                      alt={currentChat.fullName}
                      className="h-full w-full object-cover"
                    />
                  </Avatar>
                )}
                <div
                  className={cn(
                    "rounded-2xl p-3 break-words",
                    isFromCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-card"
                  )}
                >
                  <p className="text-sm">{messageContent}</p>
                  <div className={cn(
                    "flex items-center gap-1 mt-1",
                    isFromCurrentUser ? "justify-end" : "justify-start"
                  )}>
                    <span className="text-xs opacity-70">
                      {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : 'Just now'}
                    </span>
                    {isFromCurrentUser && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs opacity-70">
                          {message.timestamp && new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                        <span className="text-xs opacity-70" title={message.status || 'pending'}>
                          {message.status === 'sending' ? '🕒' : 
                           message.status === 'delivered' ? '✓✓' : 
                           message.status === 'seen' ? '✓✓👁️' : 
                           message.isRead ? '✓✓' : '✓'}
                        </span>
                        {process.env.NODE_ENV === 'development' && (
                          <span className="text-[8px] opacity-50">{message.status || 'pending'}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Typing indicator */}
        {isTyping && currentChat && (
          <div className="flex w-full justify-start">
            <div className="flex max-w-[80%] gap-2">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <img 
                  src={currentChat.profilePic} 
                  alt={currentChat.fullName}
                  className="h-full w-full object-cover"
                />
              </Avatar>
              <div className="bg-muted rounded-2xl p-3">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
