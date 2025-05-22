import React from "react";
import { useQuery } from "convex/react";
import { UserCard } from "../../user/UserCard";
import { Id } from "../../../../../convex/_generated/dataModel";
import { api } from "../../../../../convex/_generated/api";

interface Props {
  userId: Id<"users">;
  searchTerm: string;
}

export function SearchedUsers({ userId, searchTerm }: Props) {
  const searchUsers = useQuery(api.users.searchUsers, {
    currentUserId: userId,
    searchTerm,
  });

  if (searchUsers === undefined) {
    // Handle loading state
    return <div>Loading...</div>;
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
            userId={userId}
            buttonType={user.inChat ? "in_chat" : "not_in_chat"}
          />
        ))
      ) : (
        <p className="text-muted-foreground">No users found</p>
      )}
    </section>
  );
}
