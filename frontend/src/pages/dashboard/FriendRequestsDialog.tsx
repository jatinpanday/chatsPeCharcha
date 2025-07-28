import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FriendRequest } from "./types";
import { FriendRequestButton } from "@/components/FriendRequestButton";

interface FriendRequestsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  friendRequests: FriendRequest[];
  onRequestActionComplete: (requestId: string) => void;
}

export function FriendRequestsDialog({
  isOpen,
  onOpenChange,
  friendRequests,
  onRequestActionComplete,
}: FriendRequestsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Friend Requests</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {friendRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending friend requests</p>
          ) : (
            <div className="space-y-2">
              {friendRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={request.sender.profilePic} />
                      <AvatarFallback>{request.sender.fullName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{request.sender.fullName}</p>
                      <p className="text-xs text-muted-foreground">{request.sender.email}</p>
                    </div>
                  </div>
                  <FriendRequestButton
                    requestId={request._id}
                    onActionComplete={() => onRequestActionComplete(request._id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
