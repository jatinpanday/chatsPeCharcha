import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  messageText: string;
  onMessageChange: (text: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onBlur: () => void;
  className?: string;
}

export function MessageInput({
  messageText,
  onMessageChange,
  onSendMessage,
  onKeyPress,
  onBlur,
  className = "",
}: MessageInputProps) {
  return (
    <div className={cn("p-4 border-t bg-card", className)}>
      <form 
        className="flex items-center space-x-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSendMessage();
        }}
      >
        <Input
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyDown={onKeyPress}
          onBlur={onBlur}
          className="flex-1 rounded-full px-4 py-5"
          autoComplete="off"
          aria-label="Type a message"
        />
        <Button
          type="submit"
          variant="default"
          size="icon"
          className="rounded-full h-10 w-10"
          disabled={!messageText.trim()}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
