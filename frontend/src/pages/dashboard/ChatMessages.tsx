import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, Chat } from "./types";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

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
  return (
    <ScrollArea className="flex-1 w-full">
      <div className="flex flex-col h-full p-4 space-y-3">
        {messages.map((message) => {
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
                      : "bg-muted"
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
                      <span className="text-xs opacity-70">
                        {message.status === 'sending' ? '🕒' : 
                         message.status === 'delivered' ? '✓✓' : 
                         message.status === 'seen' ? '✓✓👁️' : 
                         message.isRead ? '✓✓' : '✓'}
                      </span>
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
