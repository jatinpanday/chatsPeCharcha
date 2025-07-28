import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Chat } from "./types";

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  isLoading: boolean;
}

export function ChatList({ chats, selectedChatId, onSelectChat, isLoading }: ChatListProps) {
  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading contacts...
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No contacts yet. Add someone to start chatting!
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-180px)]">
      {chats.map((chat) => (
        <div
          key={chat._id}
          className={`flex items-center p-3 hover:bg-accent cursor-pointer ${
            selectedChatId === chat._id ? "bg-accent" : ""
          }`}
          onClick={() => onSelectChat(chat._id)}
        >
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={chat.profilePic} alt={chat.fullName} />
              <AvatarFallback>
                {chat.fullName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {/* {chat.unreadCount && chat.unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                {chat.unreadCount}
              </Badge>
            )} */}
          </div>
          <div className="ml-4 flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-sm truncate">
                {chat.fullName}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {chat.lastMessage || "No messages yet"}
            </p>
          </div>
        </div>
      ))}
    </ScrollArea>
  );
}
