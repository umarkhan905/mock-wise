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
      .first();

    // check if the request is already sent
    if (existingRequest)
      return ctx.db.patch(existingRequest._id, { status: "pending" });

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

const rejectRequest = mutation({
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
    return await ctx.db.patch(request._id, { status: "rejected" });
  },
});

const getIncomingRequests = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("chatRequests")
      .withIndex("by_receiver_id_status", (q) =>
        q.eq("receiverId", args.userId).eq("status", "pending")
      )
      .collect();

    const requestsWithSender = await Promise.all(
      requests.map(async (request) => {
        const sender = await ctx.db.get(request.senderId);
        return {
          ...request,
          sender,
        };
      })
    );

    return requestsWithSender;
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

    const userChats = await Promise.all(
      chats.map(async (chat) => {
        const chatWithId =
          chat.senderId === args.userId ? chat.receiverId : chat.senderId;

        // get the chatWith user
        const [chatWith, messages] = await Promise.all([
          ctx.db.get(chatWithId),
          ctx.db
            .query("messages")
            .withIndex("by_chat_id", (q) => q.eq("chatId", chat._id))
            .order("desc") // assuming latest message comes last
            .take(1),
        ]);

        const lastMessage = messages.length > 0 ? messages[0] : null;

        return {
          chatId: chat._id,
          chatWith,
          lastMessage,
        };
      })
    );

    return userChats;
  },
});

const sendMessage = mutation({
  args: {
    chatId: v.id("chats"),
    message: v.string(),
    senderId: v.id("users"),
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

const startNewChat = mutation({
  args: {
    senderId: v.id("users"),
    receiverId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existingChat = await ctx.db
      .query("chats")
      .withIndex("by_sender_id_receiver_id", (q) =>
        q.eq("senderId", args.senderId).eq("receiverId", args.receiverId)
      )
      .first();

    if (existingChat) {
      return existingChat._id;
    }
    // create a new chat
    return await ctx.db.insert("chats", { ...args });
  },
});

export {
  sendRequest,
  acceptRequest,
  getIncomingRequests,
  sendMessage,
  getChats,
  getMessages,
  startNewChat,
  rejectRequest,
};
