"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { MessageCircle, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChatModal } from "../modals/chat/ChatModal";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { formatTime } from "@/utils/format-date-and-time";

interface Props {
  userId: Id<"users">;
  isLoaded: boolean;
}

interface ActiveUser {
  id: Id<"users">;
  username: string;
  image: string | undefined;
  isOnline?: boolean;
  lastSeen?: number;
}

export function Chats({ userId, isLoaded }: Props) {
  const [search, setSearch] = useState<string>("");
  const [openChatModal, setOpenChatModal] = useState<boolean>(false);
  const [chatId, setChatId] = useState<Id<"chats">>();
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);

  const chats = useQuery(api.messages.getChats, userId ? { userId } : "skip");

  if (!isLoaded || chats === undefined) {
    // Handle loading state
    return <div>Loading...</div>;
  }

  const filteredChats = chats.filter((chat) =>
    chat.chatWith?.username.toLocaleLowerCase().includes(search.toLowerCase())
  );

  const handleActiveChat = (
    chatId: Id<"chats">,
    activeUser: ActiveUser | null
  ) => {
    setChatId(chatId);
    setActiveUser(activeUser);
    setOpenChatModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {chats.length > 0 && (
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-8 min-h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {/* Chats */}
      {filteredChats.length > 0 ? (
        <div className="space-y-4">
          {filteredChats.map((chat) => (
            <div
              key={chat.chatId}
              className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() =>
                handleActiveChat(chat.chatId, {
                  id: chat?.chatWith?._id as Id<"users">,
                  username: chat?.chatWith?.username as string,
                  image: chat?.chatWith?.image,
                  isOnline: chat?.chatWith?.isOnline,
                  lastSeen: chat?.chatWith?.lastSeen,
                })
              }
            >
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar>
                    <AvatarImage
                      src={chat?.chatWith?.image}
                      alt={chat?.chatWith?.username}
                    />
                    <AvatarFallback>
                      {chat?.chatWith?.username.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className={`absolute -bottom-1 -right-1 block h-3 w-3 rounded-full ring-2 ring-card ${
                      chat.chatWith?.isOnline ? "bg-green-500" : "bg-gray-500"
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center">
                    <p className="font-medium">{chat?.chatWith?.username}</p>
                    <Badge
                      variant="outline"
                      className="ml-2 capitalize text-xs"
                    >
                      {chat?.chatWith?.role}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground truncate max-w-[320px]">
                    {chat?.lastMessage?.message || "Start a conversation"}
                  </p>
                </div>
              </div>

              {chat?.lastMessage && (
                <p className="text-xs text-muted-foreground">
                  {formatTime(chat?.lastMessage?.sendAt)}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <MessageCircle className="mx-auto size-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">No conversations yet</h3>
          <p className="text-muted-foreground mt-1">
            Start a new chat or browse users
          </p>
        </div>
      )}

      <ChatModal
        open={openChatModal}
        setOpen={setOpenChatModal}
        chatId={chatId}
        user={activeUser}
        senderId={userId}
      />
    </div>
  );
}
