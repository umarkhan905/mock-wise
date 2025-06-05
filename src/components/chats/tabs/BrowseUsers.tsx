"use client";

import React from "react";
import { UserCard } from "../user/UserCard";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { UserCardSkeleton } from "../skeletons/UserCardSkeleton";

interface Props {
  userId: Id<"users">;
  isLoaded: boolean;
}

export function BrowseUsers({ userId, isLoaded }: Props) {
  const users = useQuery(
    api.users.getAllUsers,
    userId ? { currentUserId: userId } : "skip"
  );

  if (!isLoaded || users === undefined) {
    // Handle loading state
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 9 }).map((_, index) => (
          <UserCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {users.map((user) => (
        <UserCard
          userId={userId}
          key={user._id}
          user={{
            _id: user._id,
            image: user.image,
            username: user.username,
            companyName: user.companyName,
            role: user.role,
          }}
          buttonType="connect"
        />
      ))}
    </div>
  );
}
