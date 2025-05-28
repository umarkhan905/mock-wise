import { NotificationCard } from "./NotificationCard";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Filters, Notification, NotificationType } from "@/types";
import { useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

interface Props {
  filter: Filters;
  type: NotificationType;
  search: string;
  notifications: Notification[];
}

export function NotificationsList({
  filter,
  type,
  notifications,
  search,
}: Props) {
  const filteredNotifications = notifications.filter((notification) => {
    const statusMatch =
      filter === "all" ||
      (filter === "read" && notification.read) ||
      (filter === "unread" && !notification.read);

    const typeMatch = type === "all" || notification.type === type;

    return statusMatch && typeMatch;
  });

  const searchedNotifications = filteredNotifications.filter((notification) => {
    return notification.title.toLowerCase().includes(search.toLowerCase());
  });

  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);
  const markAllAsRead = useMutation(
    api.notifications.markAllNotificationsAsRead
  );
  const deleteAllNotifications = useMutation(
    api.notifications.deleteAllNotifications
  );

  const handleMarkAsRead = async (_id: Id<"notifications">) => {
    try {
      await markAsRead({ notificationId: _id });
      toast.success("Notification marked as read");
    } catch (error) {
      console.log("Error while marking notification as read", error);
      toast.error("Error while marking notification as read");
    }
  };

  const handleDelete = async (_id: Id<"notifications">) => {
    try {
      await deleteNotification({ notificationId: _id });
      toast.success("Notification deleted");
    } catch (error) {
      console.log("Error while deleting notification", error);
      toast.error("Error while deleting notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      console.log("Error while marking all notifications as read", error);
      toast.error("Error while marking all notifications as read");
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllNotifications();
      toast.success("All notifications deleted");
    } catch (error) {
      console.log("Error while deleting all notifications", error);
      toast.error("Error while deleting all notifications");
    }
  };

  const unreadCount = filteredNotifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      {filteredNotifications.length > 0 && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {filteredNotifications.length} notification(s)
            {unreadCount > 0 && ` (${unreadCount} unread)`}
          </p>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleDeleteAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All
            </Button>
          </div>
        </div>
      )}

      {searchedNotifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No notifications</h3>
          <p className="text-muted-foreground">
            {filter === "unread"
              ? "You're all caught up! No unread notifications."
              : "No notifications match your current filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {searchedNotifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
