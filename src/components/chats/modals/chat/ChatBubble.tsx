import React from "react";
import { Message } from "@/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Id } from "../../../../../convex/_generated/dataModel";
import { formatTime } from "@/utils/format-date-and-time";

interface Props {
  message: Message;
  senderId: Id<"users">;
  avatarUrl: string;
  senderInitials: string;
}

export function ChatBubble({
  message,
  senderId,
  avatarUrl,
  senderInitials,
}: Props) {
  const isSender = message.senderId === senderId;

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
        {message.message}

        <p
          className={cn(
            "text-xs text-muted-foreground mt-1",
            isSender ? "text-primary" : "text-muted-foreground"
          )}
        >
          {formatTime(message.sendAt)}
        </p>
      </div>

      {isSender && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{senderInitials}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
