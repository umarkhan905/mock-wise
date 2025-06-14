"use client";

import React from "react";
import { Id } from "../../../../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { UserCardSkeleton } from "@/components/chats/skeletons/UserCardSkeleton";
import { UserCard } from "./UserCard";

interface Props {
  searchTerm: string;
  interviewId: Id<"interviews">;
  existingCandidatesIds: { userId: Id<"users">; status: string }[];
}

export function SearchCandidates({
  searchTerm,
  interviewId,
  existingCandidatesIds,
}: Props) {
  const searchUsers = useQuery(api.users.searchCandidatesForInterview, {
    searchTerm,
  });

  if (searchUsers === undefined) {
    // Handle loading state
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <UserCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  const getButtonType = (
    candidates: { userId: Id<"users">; status: string }[],
    userId: Id<"users">
  ) => {
    const candidate = candidates.find((c) => c.userId === userId);

    if (!candidate) {
      return "add";
    } else if (candidate.status === "in_progress") {
      return "in_progress";
    } else if (candidate.status === "completed") {
      return "completed";
    } else {
      return "remove";
    }
  };

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium">
        Search results for &quot;{searchTerm}&quot;
      </h2>

      {searchUsers.length > 0 ? (
        searchUsers.map((user) => (
          <UserCard
            key={user._id}
            user={{
              _id: user._id,
              image: user.image,
              username: user.username,
              companyName: user.companyName,
              role: user.role,
            }}
            interviewId={interviewId}
            buttonType={getButtonType(existingCandidatesIds, user._id)}
          />
        ))
      ) : (
        <p className="text-muted-foreground">No users found</p>
      )}
    </section>
  );
}
