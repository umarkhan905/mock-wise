import React from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ChatBubbleProps {
  message: string;
  isSender?: boolean;
  avatarUrl?: string;
  senderInitials?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isSender = false,
  avatarUrl,
  senderInitials = "AI",
}) => {
  return (
    <div
      className={cn(
        "flex items-end gap-2 mb-2",
        isSender ? "justify-end" : "justify-start"
      )}
    >
      {!isSender && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{senderInitials}</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "max-w-xs px-4 py-4 rounded-2xl text-sm shadow-sm",
          isSender
            ? "bg-primary/50 rounded-br-none"
            : "bg-muted text-foreground rounded-bl-none"
        )}
      >
        {message}
      </div>

      {isSender && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{senderInitials}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
