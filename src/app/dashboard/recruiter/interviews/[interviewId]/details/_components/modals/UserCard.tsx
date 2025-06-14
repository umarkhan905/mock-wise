"use client";

import { Roles } from "@/types/globals";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, User2, UserMinus, UserPlus } from "lucide-react";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { Id } from "../../../../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../../../../convex/_generated/api";

interface User {
  _id: Id<"users">;
  image: string | undefined;
  username: string;
  companyName: string | undefined;
  role: Roles;
}

interface Props {
  user: User;
  interviewId: Id<"interviews">;
  buttonType?: ButtonType;
}

type ButtonType = "add" | "remove" | "in_progress" | "completed";

export function UserCard({ user, interviewId, buttonType = "add" }: Props) {
  const [loading, setLoading] = useState<boolean>(false);

  //   mutation to add candidate to interview
  const inviteCandidate = useMutation(
    api.participants.inviteCandidateToInterview
  );
  const removeCandidate = useMutation(
    api.participants.removeCandidateFromInterview
  );

  const handleAddCandidate = async () => {
    setLoading(true);
    try {
      await inviteCandidate({
        interviewId,
        userId: user._id,
      });
      toast.success("Candidate invited successfully");
    } catch (error) {
      console.error("Error adding candidate:", error);
      toast.error("Failed to add candidate");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCandidate = async () => {
    setLoading(true);
    try {
      await removeCandidate({
        interviewId,
        userId: user._id,
      });
      toast.success("Candidate removed successfully");
    } catch (error) {
      console.error("Error removing candidate:", error);
      toast.error("Failed to remove candidate");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

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

      {buttonType === "add" && (
        <Button
          size="sm"
          className="min-h-9 min-w-40 bg-primary/20 text-primary hover:bg-primary/30 hover:text-primary"
          variant={"outline"}
          disabled={loading}
          onClick={handleAddCandidate}
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <UserPlus className="size-5" />
              Add Candidate
            </>
          )}
        </Button>
      )}

      {buttonType === "in_progress" && (
        <Button
          size="sm"
          className="min-h-9 min-w-40 bg-yellow-500/20 text-yellow-500"
          variant={"outline"}
          disabled
        >
          <User2 className="size-5" />
          In Progress
        </Button>
      )}

      {buttonType === "completed" && (
        <Button
          size="sm"
          className="min-h-9 min-w-40 bg-emerald-500/20 text-emerald-500"
          variant={"outline"}
          disabled
        >
          <Check className="size-5" />
          Completed
        </Button>
      )}

      {buttonType === "remove" && (
        <Button
          size="sm"
          className="min-h-9 min-w-48 bg-destructive/20 text-destructive hover:bg-destructive/30 hover:text-destructive"
          variant={"outline"}
          disabled={loading}
          onClick={handleRemoveCandidate}
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <UserMinus className="size-5" />
              Remove Candidate
            </>
          )}
        </Button>
      )}
    </div>
  );
}
