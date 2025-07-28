import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Video, MoreVertical } from "lucide-react";
import { Chat } from "./types";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { formatDistanceToNow } from "date-fns";

interface ChatHeaderProps {
  chat: Chat | null;
}

export function ChatHeader({ chat }: ChatHeaderProps) {
  const onlineUsers = useSelector((state: RootState) => state.chat.onlineUsers);
  
  if (!chat) return null;
  
  // Check if the user is online
  const isOnline = onlineUsers.includes(chat._id);
  
  // Format the last seen time - use updatedAt if lastSeen is not available
  const lastSeenTime = chat.updatedAt || chat.timestamp;
  const lastSeen = lastSeenTime 
    ? formatDistanceToNow(new Date(lastSeenTime), { addSuffix: true })
    : 'recently';

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
            {isOnline && (
              <div 
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"
                title="Online"
              ></div>
            )}
          </div>
          <div>
            <h2 className="font-semibold">{chat.fullName}</h2>
            <p className="text-sm text-muted-foreground">
              {isOnline ? "Active now" : `Last seen ${lastSeen}`}
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
