import { Bell } from "lucide-react";
import React, { useState } from "react";
import { NotificationsList } from "./notifications/NotificationList";
import { NotificationFilter } from "./notifications/NotificationFilter";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Filters, NotificationType } from "@/types";

export function Notifications() {
  const [filters, setFilters] = useState<Filters>("all");
  const [notificationType, setNotificationType] =
    useState<NotificationType>("all");
  const [search, setSearch] = useState<string>("");

  const notifications = useQuery(api.notifications.getNotifications);

  if (notifications === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading notifications...</p>
      </div>
    );
  }

  const unReadNotifications = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <section className="space-y-4">
      <div className="flex items-center space-x-2">
        <Bell className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      <NotificationFilter
        filter={filters}
        type={notificationType}
        unReadNotifications={unReadNotifications}
        search={search}
        onSearchChange={setSearch}
        onFilterChange={setFilters}
        onTypeChange={setNotificationType}
      />

      <NotificationsList
        filter={filters}
        type={notificationType}
        search={search}
        notifications={notifications}
      />
    </section>
  );
}
