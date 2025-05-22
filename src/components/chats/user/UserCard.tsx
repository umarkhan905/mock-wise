"use client";

import { Roles } from "@/types/globals";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, MessageCircle, UserPlus, X } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";

interface User {
  _id: Id<"users">;
  image: string | undefined;
  username: string;
  companyName: string | undefined;
  role: Roles;
}

type ButtonType = "in_chat" | "not_in_chat" | "connect" | "request";

interface Props {
  userId: Id<"users">;
  user: User;
  buttonType: ButtonType;
  requestId?: Id<"chatRequests">;
}

type Loading = "send_request" | "accept_request" | "reject_request" | null;

export function UserCard({ userId, user, buttonType, requestId }: Props) {
  const [loadingUserId, setLoadingUserId] = useState<Id<"users"> | null>(null);
  const [loading, setLoading] = useState<Loading>(null);

  const startNewChat = useMutation(api.messages.startNewChat);
  const sendRequest = useMutation(api.messages.sendRequest);
  const acceptRequest = useMutation(api.messages.acceptRequest);
  const rejectRequest = useMutation(api.messages.rejectRequest);

  const handleStartNewChat = async (receiverId: Id<"users">) => {
    setLoadingUserId(receiverId);
    try {
      await startNewChat({
        senderId: userId,
        receiverId,
      });
      toast.success("New chat started successfully");
    } catch (error) {
      console.log("Error while starting new chat", error);
      toast.error("Error while starting new chat");
    } finally {
      setLoadingUserId(null);
    }
  };

  const handleSendRequest = async (receiverId: Id<"users">) => {
    setLoading("send_request");
    setLoadingUserId(receiverId);

    try {
      await sendRequest({
        senderId: userId,
        receiverId,
      });
      toast.success("Request sent successfully");
    } catch (error) {
      console.log("Error while sending request", error);
      toast.error("Error while sending request");
    } finally {
      setLoading(null);
      setLoadingUserId(null);
    }
  };

  const handleAcceptRequest = async (requestId: Id<"chatRequests">) => {
    setLoading("accept_request");

    try {
      await acceptRequest({
        requestId,
      });
      toast.success("Request accepted successfully");
    } catch (error) {
      console.log("Error while accepting request", error);
      toast.error("Error while accepting request");
    } finally {
      setLoading(null);
    }
  };

  const handleRejectRequest = async (requestId: Id<"chatRequests">) => {
    setLoading("reject_request");
    try {
      await rejectRequest({
        requestId,
      });
      toast.success("Request rejected successfully");
    } catch (error) {
      console.log("Error while rejecting request", error);
      toast.error("Error while rejecting request");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Avatar>
            <AvatarImage src={user.image} alt={user.username} />
            <AvatarFallback>{user.username.substring(0, 2)}</AvatarFallback>
          </Avatar>
        </div>

        <div>
          <p className="font-medium">{user.username}</p>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="capitalize text-xs">
              {user.role}
            </Badge>

            {user.companyName && (
              <p className="text-xs text-muted-foreground">
                {user.companyName}
              </p>
            )}
          </div>
        </div>
      </div>

      {buttonType === "in_chat" && (
        <Button size="sm" className="min-h-9 min-w-30 text-white">
          <MessageCircle className="size-5" />
          Chat
        </Button>
      )}

      {buttonType === "not_in_chat" && (
        <Button
          size="sm"
          className="min-h-9 min-w-30 text-white"
          disabled={loadingUserId === user._id}
          onClick={() => handleStartNewChat(user._id)}
          variant={"outline"}
        >
          {loadingUserId === user._id ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <MessageCircle className="size-5" />
              New Chat
            </>
          )}
        </Button>
      )}

      {buttonType === "connect" && (
        <Button
          size="sm"
          className="min-h-9 min-w-30 text-white"
          disabled={loading === "send_request" || loadingUserId === user._id}
          onClick={() => handleSendRequest(user._id)}
          variant={"secondary"}
        >
          {loadingUserId === user._id ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <UserPlus className="size-5" />
              Connect
            </>
          )}
        </Button>
      )}

      {buttonType === "request" && (
        <div className="flex items-center justify-center gap-2">
          <Button
            size={"icon"}
            variant={"destructive"}
            title="Decline"
            className="rounded-full"
            disabled={loading === "reject_request"}
            onClick={() => handleRejectRequest(requestId!)}
          >
            {loading === "reject_request" ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <X className="size-5" />
            )}
          </Button>

          <Button
            size={"icon"}
            variant={"secondary"}
            title="Accept"
            className="rounded-full"
            disabled={loading === "accept_request"}
            onClick={() => handleAcceptRequest(requestId!)}
          >
            {loading === "accept_request" ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Check className="size-5" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
