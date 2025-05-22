import { AuthContextProvider } from "@/context/AuthStore";
import React from "react";
import { PresenceHandlerProvider } from "./_components/providers/PresenceHandlerProvider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthContextProvider>
      <PresenceHandlerProvider>{children}</PresenceHandlerProvider>
    </AuthContextProvider>
  );
}
