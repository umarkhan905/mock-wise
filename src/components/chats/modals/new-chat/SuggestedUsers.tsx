import { useQuery } from "convex/react";
import React from "react";
import { UserCard } from "../../user/UserCard";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { UserCardSkeleton } from "../../skeletons/UserCardSkeleton";
import { User } from "lucide-react";

interface Props {
  userId: Id<"users">;
}

export function SuggestedUsers({ userId }: Props) {
  const suggestedUsers = useQuery(api.users.getSuggestedUsers, {
    currentUserId: userId,
  });

  if (suggestedUsers === undefined) {
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
      {suggestedUsers.length > 0 ? (
        <>
          <h2 className="text-lg font-medium">Suggested users</h2>
          {suggestedUsers?.map((user) => (
            <UserCard
              key={user._id}
              user={{
                _id: user._id,
                image: user.image,
                username: user.username,
                companyName: user.companyName,
                role: user.role,
              }}
              userId={userId}
              buttonType="not_in_chat"
            />
          ))}
        </>
      ) : (
        <div className="text-center py-10">
          <User className="mx-auto size-10 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium">No suggested users</h3>
          <p className="text-muted-foreground mt-1">
            You don&apos;t have any suggested users
          </p>
        </div>
      )}
    </section>
  );
}
