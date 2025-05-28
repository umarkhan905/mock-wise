import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Check,
  Trash2,
  Calendar,
  Bell,
  Settings,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Notification } from "@/types";
import { Id } from "../../../../../../convex/_generated/dataModel";

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: Id<"notifications">) => Promise<void>;
  onDelete: (id: Id<"notifications">) => Promise<void>;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "interview":
      return <Calendar className="h-5 w-5 text-blue-500" />;
    case "reminder":
      return <Bell className="h-5 w-5 text-yellow-500" />;
    case "system":
      return <Settings className="h-5 w-5 text-gray-500" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

const getTypeVariant = (
  type: string
): "default" | "secondary" | "destructive" | "outline" => {
  switch (type) {
    case "interview":
      return "default";
    case "reminder":
      return "secondary";
    case "system":
      return "outline";
    default:
      return "outline";
  }
};

export function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationCardProps) {
  const timeAgo = formatDistanceToNow(new Date(notification._creationTime), {
    addSuffix: true,
  });

  return (
    <Card
      className={`transition-all duration-200 ${
        notification.read
          ? "bg-card hover:bg-card/80"
          : "bg-primary/5 border-primary/20 hover:bg-primary/10"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-1">
            {getNotificationIcon(notification.type)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold truncate">
                  {notification.title}
                </h4>
                {!notification.read && (
                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={getTypeVariant(notification.type || "interview")}
                  className="text-xs"
                >
                  {notification.type || "interview"}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-[10000]">
                    {!notification.read && (
                      <DropdownMenuItem
                        onClick={() => onMarkAsRead(notification._id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark as read
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDelete(notification._id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
              {notification.message}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{timeAgo}</span>

              {notification.action && (
                <Link href={notification.action.url}>
                  <Button variant="outline" size="sm" className="h-7">
                    {notification.action.label}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
