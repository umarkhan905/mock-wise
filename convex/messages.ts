import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const sendRequest = mutation({
  args: {
    senderId: v.id("users"),
    receiverId: v.id("users"),
  },

  handler: async (ctx, args) => {
    const existingRequest = await ctx.db
      .query("chatRequests")
      .withIndex("by_sender_id_receiver_id", (q) =>
        q.eq("senderId", args.senderId).eq("receiverId", args.receiverId)
      )
      .filter((q) => q.eq("status", "pending"))
      .first();

    if (existingRequest) return existingRequest._id;

    return await ctx.db.insert("chatRequests", { ...args, status: "pending" });
  },
});

const acceptRequest = mutation({
  args: {
    requestId: v.id("chatRequests"),
  },

  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);

    if (!request) {
      throw new ConvexError("Request not found");
    }

    if (request.status !== "pending") {
      throw new ConvexError("Request is not pending");
    }

    // update the request
    await ctx.db.patch(request._id, { status: "accepted" });

    // create a chat
    return await ctx.db.insert("chats", {
      senderId: request.senderId,
      receiverId: request.receiverId,
    });
  },
});

const getIncomingRequests = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatRequests")
      .withIndex("by_receiver_id", (q) => q.eq("receiverId", args.userId))
      .filter((q) => q.eq("status", "pending"))
      .collect();
  },
});

const getChats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const chats = await ctx.db
      .query("chats")
      .filter((q) =>
        q.or(
          q.eq(q.field("senderId"), args.userId),
          q.eq(q.field("receiverId"), args.userId)
        )
      )
      .collect();

    return chats;
  },
});

const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      ...args,
      status: "sent",
      sendAt: Date.now(),
    });
  },
});

const getMessages = query({
  args: {
    chatId: v.id("chats"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_chat_id", (q) => q.eq("chatId", args.chatId))
      .collect();
  },
});

export {
  sendRequest,
  acceptRequest,
  getIncomingRequests,
  sendMessage,
  getChats,
  getMessages,
};
