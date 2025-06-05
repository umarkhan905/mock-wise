"use client";

import { useQuery } from "convex/react";
import React from "react";
import { UserCard } from "../user/UserCard";
import { Roles } from "@/types/globals";
import { UserPlus } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { UserCardSkeleton } from "../skeletons/UserCardSkeleton";

interface Props {
  userId: Id<"users">;
  isLoaded: boolean;
}

export function IncomingRequests({ userId, isLoaded }: Props) {
  const incomingRequests = useQuery(
    api.messages.getIncomingRequests,
    userId ? { userId } : "skip"
  );

  if (!isLoaded || incomingRequests === undefined) {
    // Handle loading state
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 9 }).map((_, index) => (
          <UserCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  // TODO: Show only users that are not already in a chat and not request being sent
  // TODO: Add pagination
  // TODO: Add search
  // TODO: Add with draw request button if request is sent by the user
  // TODO: show new chat button only to recruiters

  return (
    <section className="space-y-4">
      {incomingRequests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incomingRequests.map((request) => (
            <UserCard
              key={request._id}
              user={{
                _id: request.senderId,
                image: request?.sender?.image as string,
                username: request?.sender?.username as string,
                companyName: request?.sender?.companyName as string,
                role: request?.sender?.role as Roles,
              }}
              buttonType="request"
              userId={userId}
              requestId={request._id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <UserPlus className="mx-auto size-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">No incoming requests</h3>
          <p className="text-muted-foreground mt-1">
            You have no incoming requests at the moment. Check back later or
            browse users to connect with.
          </p>
        </div>
      )}
    </section>
  );
}
