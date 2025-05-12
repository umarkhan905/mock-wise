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
import { NavUser } from "./NavUser";
import { NavMain } from "./NavMain";
import {
  candidateSidebarNavigation,
  recruiterSidebarNavigation,
} from "@/constants";

type UserData = {
  name: string;
  email: string;
  avatar: string;
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
  return (
    <Sidebar {...props} collapsible="icon">
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
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
