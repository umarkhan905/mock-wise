"use client";

import React from "react";
import { UserButton } from "@clerk/nextjs";
import { Bell, User } from "lucide-react";
import { Notifications } from "./Notifications";
import { Account } from "./Account";

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

      <UserButton.UserProfilePage
        label="Account"
        url="account"
        labelIcon={<User className="size-4" />}
      >
        <Account />
      </UserButton.UserProfilePage>
    </UserButton>
  );
}
