import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Send as SendIcon, UserPlus, Bell } from "lucide-react";
import { ChatList } from "./ChatList";
import { FriendRequestsDialog } from "./FriendRequestsDialog";
import { SendFriendRequestDialog } from "./SendFriendRequestDialog";
import { Chat, FriendRequest } from "./types";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  isLoading: boolean;
  friendRequests: FriendRequest[];
  onRequestActionComplete: (requestId: string) => void;
  onSendRequest: (emailOrId: string) => void;
  isSearching: boolean;
  searchResults: Array<{ _id: string; fullName: string; profilePic?: string }>;
  searchText: string;
  onSearchTextChange: (text: string) => void;
  isSendDialogOpen: boolean;
  setIsSendDialogOpen: (open: boolean) => void;
  isRequestsOpen: boolean;
  setIsRequestsOpen: (open: boolean) => void;
}

export function Sidebar({
  chats,
  selectedChatId,
  onSelectChat,
  isLoading,
  friendRequests,
  onRequestActionComplete,
  onSendRequest,
  isSearching,
  searchResults,
  searchText,
  onSearchTextChange,
  isSendDialogOpen,
  setIsSendDialogOpen,
  isRequestsOpen,
  setIsRequestsOpen
}: SidebarProps) {
  const [email, setEmail] = useState("");

  return (
    <div className="w-80 border-r bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Chats</h2>
          <div className="flex items-center space-x-2">
            {/* Friend Requests Button with Badge */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative"
                    onClick={() => setIsRequestsOpen(true)}
                  >
                    <Bell className="h-5 w-5" />
                    {friendRequests.length > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full"
                      >
                        {friendRequests.length > 9 ? '9+' : friendRequests.length}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Friend Requests</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Send Friend Request Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSendDialogOpen(true)}
                  >
                    <UserPlus className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Friend</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <FriendRequestsDialog
              isOpen={isRequestsOpen}
              onOpenChange={setIsRequestsOpen}
              friendRequests={friendRequests}
              onRequestActionComplete={onRequestActionComplete}
            />

            <SendFriendRequestDialog
              isOpen={isSendDialogOpen}
              onOpenChange={setIsSendDialogOpen}
              onSendRequest={onSendRequest}
              isSearching={isSearching}
              searchResults={searchResults}
              email={email}
              onEmailChange={setEmail}
            />
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchText}
            onChange={(e) => onSearchTextChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <ChatList
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={onSelectChat}
        isLoading={isLoading}
      />
    </div>
  );
}
