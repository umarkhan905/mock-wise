"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { NavMain } from "./NavMain";
import {
  candidateSidebarNavigation,
  recruiterSidebarNavigation,
} from "@/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/AuthStore";

type UserData = {
  username: string;
  clerkId: string;
  email: string;
  role: "recruiter" | "candidate" | "admin";
  image?: string;
};
type SidebarFor = "candidate" | "recruiter";

export function AppSidebar({
  sidebarFor = "candidate",
  userData,
  ...props
}: { sidebarFor?: SidebarFor; userData: UserData } & React.ComponentProps<
  typeof Sidebar
>) {
  const navItems =
    sidebarFor === "candidate"
      ? candidateSidebarNavigation
      : recruiterSidebarNavigation;

  const { user } = useAuthContext();

  return (
    <Sidebar {...props} collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-transparent border-b rounded-none py-7"
            >
              <Link href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                  {/* <GalleryVerticalEnd className="size-4" /> */}
                  <img
                    src="/logo.png"
                    alt="logo"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Mock Wise</span>
                  <span className="">AI Interview Simulator</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} sidebarFor={sidebarFor} />
      </SidebarContent>
      <SidebarFooter>
        {/* interview credits */}
        <div className="space-y-2 p-3 border-2 border-primary/50 rounded-md">
          <div className="flex items-center gap-2">
            <Crown className="size-6 text-primary" />

            <div className="w-full">
              <Progress
                value={
                  (Number(user?.credits?.used) / Number(user?.credits?.total)) *
                  100
                }
                className="mb-1"
              />

              <div className="flex justify-between">
                <span className="text-xs">Interview Credits</span>
                <span className="text-xs">
                  {user?.credits?.used}/{user?.credits?.total}
                </span>
              </div>
            </div>
          </div>

          <Button asChild className="w-full text-white" size="sm">
            <Link href="/dashboard/recruiter/billing">Buy Credits</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 px-2 py-2">
          <Avatar className="size-8 rounded-full">
            <AvatarImage src={userData.image} alt={userData.username} />
            <AvatarFallback className="rounded-full">
              {userData.username.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{userData.username}</span>
            <span className="truncate text-xs">{userData.email}</span>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
