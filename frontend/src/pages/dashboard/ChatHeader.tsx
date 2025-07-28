import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Video, MoreVertical } from "lucide-react";
import { Chat } from "./types";

interface ChatHeaderProps {
  chat: Chat | null;
}

export function ChatHeader({ chat }: ChatHeaderProps) {
  if (!chat) return null;

  return (
    <div className="p-4 border-b bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={chat.profilePic} alt={chat.fullName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {chat.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {chat.online && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold">{chat.fullName}</h2>
            <p className="text-sm text-muted-foreground">
              {chat.online ? "Active now" : `Last seen ${chat.timestamp || 'recently'}`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
