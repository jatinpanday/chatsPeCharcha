import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  _id: string;
  fullName: string;
  profilePic?: string;
}

interface SendFriendRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSendRequest: (emailOrId: string) => void;
  isSearching: boolean;
  searchResults: User[];
  email: string;
  onEmailChange: (email: string) => void;
}

export function SendFriendRequestDialog({
  isOpen,
  onOpenChange,
  onSendRequest,
  isSearching,
  searchResults,
  email,
  onEmailChange,
}: SendFriendRequestDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Friend Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              disabled={isSearching}
            />
          </div>
          <Button
            className="w-full"
            onClick={() => onSendRequest(email)}
            disabled={!email || isSearching}
          >
            {isSearching ? 'Sending...' : 'Send Friend Request'}
          </Button>

          {searchResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Search Results</h4>
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div key={user._id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        <AvatarImage src={user.profilePic} />
                        <AvatarFallback>{user.fullName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{user.fullName}</span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        onSendRequest(user._id);
                        onEmailChange('');
                      }}
                      disabled={isSearching}
                    >
                      Send Request
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
