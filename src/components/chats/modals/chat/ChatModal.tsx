"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery } from "convex/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, Smile } from "lucide-react";
import { ChatBubble } from "./ChatBubble";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { formatTime } from "@/utils/format-date-and-time";

interface User {
  id: Id<"users">;
  username: string;
  image: string | undefined;
  isOnline?: boolean;
  lastSeen?: number;
}

interface Props {
  open: boolean;
  chatId: Id<"chats"> | undefined;
  senderId: Id<"users">;
  user: User | null;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ChatModal({ open, chatId, user, senderId, setOpen }: Props) {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const messages = useQuery(
    api.messages.getMessages,
    chatId ? { chatId } : "skip"
  );

  const sendMessage = useMutation(api.messages.sendMessage);

  const handleSendMessage = async () => {
    if (!chatId) return;

    if (!message) return toast.error("Please enter a message");
    setLoading(true);

    try {
      await sendMessage({
        chatId,
        message,
        senderId,
      });
      setMessage("");
      toast.success("Message sent successfully");
    } catch (error) {
      console.log("Error while sending message", error);
      toast.error("Error while sending message");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = () => {
    setOpen((prev) => !prev);
    setMessage("");
    setLoading(false);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    if (!open || !messages) return;

    const timeout = setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [open, messages]);

  if (!chatId || !user) {
    return null; // or some fallback UI
  }

  // TODO: Fix handle click outside close emoji picker
  // TODO: send message on enter

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="px-3">
        <DialogHeader className="items-start">
          <div className="flex items-center gap-4 border-b border-border w-full pb-3">
            <Avatar className="size-11">
              <AvatarImage src={user.image} alt="User Image" />
              <AvatarFallback>
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <DialogTitle className="font-semibold text-base">
                {user.username}
              </DialogTitle>
              <DialogDescription className="text-start text-sm">
                {user.isOnline
                  ? "Online"
                  : "Last seen at " + formatTime(user.lastSeen || Date.now())}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* messages */}
        <section
          className="h-80 overflow-y-scroll scrollbar-hide scroll-smooth"
          ref={messagesContainerRef}
        >
          {messages && messages?.length > 0 ? (
            messages.map((message) => (
              <ChatBubble
                key={message._id}
                message={message}
                senderId={senderId}
                avatarUrl={user.image || ""}
                senderInitials={user.username.charAt(0).toUpperCase()}
              />
            ))
          ) : (
            <div className="flex items-center justify-center size-full">
              <div className="text-center">
                <MessageCircle className="mx-auto size-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No messages yet</h3>
                <p className="text-muted-foreground mt-1">
                  Start a conversation with {user.username}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* message input */}
        <div className="flex border-2 border-border rounded-md w-full bg-muted/10 p-1 gap-x-2 relative">
          <input
            className="flex-1 min-h-9 px-1 outline-none placeholder:text-sm text-sm"
            placeholder={`Message ${user.username}`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          {/* emoji */}
          <Button
            size="icon"
            variant="outline"
            className="text-white"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
          >
            <Smile className="size-5" />
          </Button>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <EmojiPicker
              onEmojiClick={(emoji) => {
                setMessage((prev) => prev + emoji.emoji);
              }}
              searchPlaceHolder="Search emojis"
              theme={Theme.DARK}
              searchDisabled
              skinTonesDisabled
              previewConfig={{
                showPreview: false,
              }}
              width={"300px"}
              height={"300px"}
              style={{
                position: "absolute",
                top: "-310px",
                right: "0px",
              }}
            />
          )}

          {/* send */}
          <Button
            size="icon"
            className="text-white"
            disabled={!message || loading}
            onClick={handleSendMessage}
          >
            <Send className="size-5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
