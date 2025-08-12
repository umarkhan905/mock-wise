"use client";

import React from "react";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppSidebar } from "@/components/dashboard/sidebar/Appsidebar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useAuthContext } from "@/context/AuthStore";
import { UserProfile } from "@/components/dashboard/sidebar/custom-user-pages/UserProfile";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { SmallNotificationCard } from "@/components/dashboard/notifications/SmallNotificationCard";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { user } = useAuthContext();

  const notifications = useQuery(api.notifications.getUnreadNotifications);

  if (!user) return null;

  return (
    <SidebarProvider>
      <AppSidebar sidebarFor="recruiter" userData={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b sticky top-0 bg-background z-[2]">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>

          <div className="flex items-center gap-4 ml-auto px-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
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
              </DropdownMenuTrigger>
              <DropdownMenuContent className="z-[9999999]">
                <DropdownMenuLabel>
                  Latest Unread Notifications
                  <Badge
                    className="ml-2 size-5 rounded-full bg-primary/60"
                    variant="outline"
                  >
                    {notifications?.length || 0}
                  </Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-1 space-y-2">
                  {notifications && notifications.length === 0 && (
                    <div className="text-center py-4 px-2">
                      <Bell className="size-8 text-muted-foreground mx-auto mb-3" />
                      <h3 className="font-medium mb-2">No notifications</h3>
                      <p className="text-muted-foreground text-sm">
                        You&apos;re all caught up! No unread notifications.
                      </p>
                    </div>
                  )}

                  {/* notifications */}
                  {notifications &&
                    notifications.length > 0 &&
                    notifications
                      .slice(0, 3)
                      .map((notification) => (
                        <SmallNotificationCard
                          key={notification._id}
                          notification={notification}
                        />
                      ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <UserProfile />
          </div>
        </header>
        <main className="p-5">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
