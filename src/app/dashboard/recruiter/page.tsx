import { SignedIn, UserButton } from "@clerk/nextjs";
import React from "react";

export default function Dashboard() {
  return (
    <div>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
