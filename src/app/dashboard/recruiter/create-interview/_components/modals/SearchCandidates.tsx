import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { UserCard } from "./UserCard";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { UserCardSkeleton } from "@/components/chats/skeletons/UserCardSkeleton";

interface Props {
  searchTerm: string;
  interviewId: Id<"interviews">;
  scheduledAt: string;
}

export function SearchCandidates({
  searchTerm,
  interviewId,
  scheduledAt,
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
            scheduledAt={new Date(scheduledAt).getTime()}
          />
        ))
      ) : (
        <p className="text-muted-foreground">No users found</p>
      )}
    </section>
  );
}
