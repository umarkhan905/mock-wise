import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const sendMessage = mutation({
  args: {
    senderId: v.id("users"),
    receiverId: v.id("users"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("messages", {
      senderId: args.senderId,
      receiverId: args.receiverId,
      message: args.message,
      status: "sent",
    });
  },
});

const updateMessageStatus = mutation({
  args: {
    messageId: v.id("messages"),
    status: v.union(
      v.literal("sent"),
      v.literal("received"),
      v.literal("read")
    ),
  },
  handler: async (ctx, args) => {
    return ctx.db.patch(args.messageId, {
      status: args.status,
    });
  },
});

const getMessages = query({
  args: {
    senderId: v.id("users"),
    receiverId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("messages")
      .withIndex("by_sender_id_receiver_id", (q) =>
        q.eq("senderId", args.senderId).eq("receiverId", args.receiverId)
      )
      .collect();
  },
});

export { sendMessage, updateMessageStatus, getMessages };
