import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const createNotification = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("notifications", args);
  },
});

const deleteNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    return ctx.db.delete(args.notificationId);
  },
});

const getNotifications = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("notifications")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

const getUnreadNotifications = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("notifications")
      .withIndex("by_read_user_id", (q) =>
        q.eq("read", false).eq("userId", args.userId)
      )
      .order("desc")
      .collect();
  },
});

const markNotificationAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    return ctx.db.patch(args.notificationId, { read: true });
  },
});

export {
  createNotification,
  deleteNotification,
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
};
