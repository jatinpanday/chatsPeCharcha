import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import useMutation from "../hooks/useMutation";
import { API_ACCEPT_REQUEST, API_REJECT_REQUEST } from "../imports/api";

interface FriendRequestButtonProps {
  requestId: string;
  onActionComplete?: () => void;
}

export const FriendRequestButton = ({ requestId, onActionComplete }: FriendRequestButtonProps) => {
  const { toast } = useToast();
  const { mutate, isLoading } = useMutation();

  const handleAction = async (action: 'accept' | 'reject') => {
    try {
      const url = action === 'accept' 
        ? `${API_ACCEPT_REQUEST}/${requestId}`
        : `${API_REJECT_REQUEST}/${requestId}`;

      const result = await mutate({
        url,
        method: 'PUT',
        data: {}
      });

      if (result.success) {
        toast({
          title: "Success",
          description: `Friend request ${action}ed successfully`
        });
        onActionComplete?.();
      } else {
        throw new Error(result.message || `Failed to ${action} friend request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} friend request`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => handleAction('reject')}
        disabled={isLoading}
      >
        Reject
      </Button>
      <Button 
        size="sm"
        onClick={() => handleAction('accept')}
        disabled={isLoading}
      >
        Accept
      </Button>
    </div>
  );
};
