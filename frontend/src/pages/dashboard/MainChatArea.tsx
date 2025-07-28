import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { MessageInput } from "./MessageInput";
import { Chat, Message } from "./types";

interface MainChatAreaProps {
  currentChat: Chat | null;
  currentUser: {
    _id: string;
    fullName: string;
    profilePic?: string;
  } | null;
  messages: Message[];
  messageText: string;
  onMessageChange: (text: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onInputBlur: () => void;
  isTyping: boolean;
  onTypingChange: (isTyping: boolean) => void;
}

export function MainChatArea({
  currentChat,
  currentUser,
  messages,
  messageText,
  onMessageChange,
  onSendMessage,
  onKeyPress,
  onInputBlur,
  isTyping,
  onTypingChange,
}: MainChatAreaProps) {
  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/50">
        <div className="text-center space-y-2 p-6 max-w-md">
          <div className="h-12 w-12 mx-auto flex items-center justify-center text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-10 w-10"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium">No chat selected</h3>
          <p className="text-sm text-muted-foreground">
            Select a chat from the sidebar or start a new conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader chat={currentChat} />
      <ChatMessages 
        messages={messages} 
        isTyping={isTyping}
        currentChat={currentChat}
        currentUser={currentUser}
      />
      <MessageInput
        messageText={messageText}
        onMessageChange={(text) => {
          onMessageChange(text);
          if (text.trim()) {
            onTypingChange(true);
          } else {
            onTypingChange(false);
          }
        }}
        onSendMessage={onSendMessage}
        onKeyPress={onKeyPress}
        onBlur={onInputBlur}
      />
    </div>
  );
}
