import { useQuery } from "convex/react";
import React from "react";
import { UserCard } from "../../user/UserCard";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface Props {
  userId: Id<"users">;
}

export function SuggestedUsers({ userId }: Props) {
  const suggestedUsers = useQuery(api.users.getSuggestedUsers, {
    currentUserId: userId,
  });

  if (suggestedUsers === undefined) {
    // Handle loading state
    return <div>Loading...</div>;
  }

  return (
    <section className="space-y-4">
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
    </section>
  );
}
