import { AuthContextProvider } from "@/context/AuthStore";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
}
