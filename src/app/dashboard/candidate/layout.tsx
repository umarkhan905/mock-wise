"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AppSidebar } from "@/components/dashboard/sidebar/Appsidebar";
import { Button } from "@/components/ui/button";
import { Bell, Settings } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuthContext } from "@/context/AuthStore";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = useAuthContext();

  const notifications = useQuery(
    api.notifications.getNotifications,
    user
      ? {
          userId: user._id,
        }
      : "skip"
  );

  if (!user) return null;

  return (
    <SidebarProvider>
      <AppSidebar userData={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b sticky top-0 bg-background">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2 ml-auto px-4">
            <Button
              variant={"ghost"}
              className="hover:bg-primary/20 hover:text-white relative"
              size={"icon"}
            >
              <Bell className="size-5" />

              <span className="absolute top-0 -right-1 size-4 flex items-center justify-center rounded-full bg-primary text-xs">
                {notifications?.length || 0}
              </span>
            </Button>

            <Button
              variant={"ghost"}
              className="hover:bg-primary/20 hover:text-white"
              size={"icon"}
            >
              <Settings className="size-5" />
            </Button>
          </div>
        </header>
        <main className="p-5">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
