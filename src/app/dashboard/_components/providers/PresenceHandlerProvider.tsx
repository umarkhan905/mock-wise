"use client";

import { useMutation, useQuery } from "convex/react";
import React, { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "../../../../../convex/_generated/api";

export function PresenceHandlerProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { userId, isLoaded } = useAuth();
  const user = useQuery(
    api.users.getUserByClerkId,
    userId
      ? {
          clerkId: userId,
        }
      : "skip"
  );
  const setOnlineStatus = useMutation(api.users.setOnlineStatus);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const setOnline = () => {
      setOnlineStatus({ userId: user._id, isOnline: true });
    };

    const setOffline = () => {
      setOnlineStatus({ userId: user._id, isOnline: false });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setOffline();
      } else {
        setOnline();
      }
    };

    // Set status based on network state
    if (navigator.onLine) {
      setOnline();
    } else {
      setOffline();
    }

    window.addEventListener("beforeunload", setOffline);
    window.addEventListener("offline", setOffline);
    window.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", setOffline);
      window.removeEventListener("offline", setOffline);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isLoaded, user, setOnlineStatus]);

  return children;
}
