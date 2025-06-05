"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { createContext, use, useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { User } from "@/types";
import { Loader2 } from "lucide-react";

interface AuthContextProps {
  user: User | undefined;
  setUser: (user: User | undefined) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const dbUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser ? { clerkId: clerkUser.id } : "skip"
  );

  useEffect(() => {
    if (dbUser) setUser(dbUser);
  }, [dbUser]);

  if (!isUserLoaded || dbUser === undefined)
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary size-7" />
      </div>
    );

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
