"use client";

import { Roles } from "@/types/globals";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { createContext, use, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type User = {
  _id: Id<"users">;
  clerkId: string;
  email: string;
  role: Roles;
};

interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const dbUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser ? { clerkId: clerkUser.id } : "skip"
  );

  useEffect(() => {
    if (dbUser) setUser(dbUser);
  }, [dbUser]);

  if (!isUserLoaded || !clerkUser || dbUser === undefined) return null;

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = use(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthContextProvider");
  }
  return context;
};
