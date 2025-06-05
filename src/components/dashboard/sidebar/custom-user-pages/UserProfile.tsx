"use client";

import React from "react";
import { UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import { Notifications } from "./Notifications";

export function UserProfile() {
  return (
    <UserButton>
      {/* Notifications Page extends with UserButton (clerk) */}
      <UserButton.UserProfilePage
        label="Notifications"
        url="notifications"
        labelIcon={<Bell className="size-4" />}
      >
        <Notifications />
      </UserButton.UserProfilePage>
    </UserButton>
  );
}
