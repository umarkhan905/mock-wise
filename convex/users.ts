import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const createUser = mutation({
  args: {
    username: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    clerkId: v.string(),
    stripeCustomerId: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("candidate"),
      v.literal("recruiter")
    ),
    companyName: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    credits: v.object({
      total: v.number(),
      remaining: v.number(),
      used: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    //   if user exists, return existing user
    if (existingUser) return existingUser._id;

    const userId = await ctx.db.insert("users", args);
    return userId;
  },
});

const deleteUser = mutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
      return user._id;
    }
  },
});

const getUserByClerkId = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

const getUserByStripeCustomerId = query({
  args: {
    stripeCustomerId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_stripe_customer_id", (q) =>
        q.eq("stripeCustomerId", args.stripeCustomerId)
      )
      .unique();
  },
});

const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

const getAllUsers = query({
  args: {
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // TODO: add pagination for large datasets
    const users = await ctx.db
      .query("users")
      .filter((q) => q.neq(q.field("_id"), args.currentUserId))
      .collect();

    return users;
  },
});

const getSuggestedUsers = query({
  args: {
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // TODO: add pagination for large datasets
    // get user chats and filter out users who are already in the chat

    const chats = await ctx.db
      .query("chats")
      .filter((q) =>
        q.or(
          q.eq(q.field("senderId"), args.currentUserId),
          q.eq(q.field("receiverId"), args.currentUserId)
        )
      )
      .collect();

    const excludedUserIds = new Set(
      chats.map((chat) => {
        return chat.senderId === args.currentUserId
          ? chat.receiverId
          : chat.senderId;
      })
    );

    // Add currentUserId to the exclusion list
    excludedUserIds.add(args.currentUserId);

    const suggestedUsers = [];

    for await (const user of ctx.db.query("users")) {
      if (!excludedUserIds.has(user._id)) {
        suggestedUsers.push(user);

        if (suggestedUsers.length >= 10) {
          break;
        }
      }
    }

    return suggestedUsers;
  },
});

const searchUsers = query({
  args: {
    searchTerm: v.string(),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // TODO: add pagination for large datasets
    // get user chats and filter out users who are already in the chat
    const chats = await ctx.db
      .query("chats")
      .filter((q) =>
        q.or(
          q.eq(q.field("senderId"), args.currentUserId),
          q.eq(q.field("receiverId"), args.currentUserId)
        )
      )
      .collect();
    const excludedUserIds = new Set(
      chats.map((chat) => {
        return chat.senderId === args.currentUserId
          ? chat.receiverId
          : chat.senderId;
      })
    );

    // Add currentUserId to the exclusion list
    excludedUserIds.add(args.currentUserId);

    const users = await ctx.db
      .query("users")
      .withSearchIndex("by_search_username", (q) =>
        q.search("username", args.searchTerm)
      )
      .filter((q) => q.neq(q.field("_id"), args.currentUserId))
      .collect();

    const filteredUsers = users.map((user) =>
      excludedUserIds.has(user._id)
        ? { ...user, inChat: true }
        : { ...user, inChat: false }
    );

    return filteredUsers;
  },
});

const setOnlineStatus = mutation({
  args: {
    userId: v.id("users"),
    isOnline: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(args.userId, {
      isOnline: args.isOnline,
      lastSeen: args.isOnline ? undefined : Date.now(),
    });
  },
});

const searchCandidatesForInterview = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const searchByUsername = ctx.db
      .query("users")
      .withSearchIndex("by_search_username", (q) =>
        q.search("username", args.searchTerm)
      )
      .filter((q) => q.eq(q.field("role"), "candidate"));

    const searchByEmail = ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.searchTerm))
      .filter((q) => q.eq(q.field("role"), "candidate"));

    const users = await Promise.all([
      searchByUsername.collect(),
      searchByEmail.collect(),
    ]);

    // remove duplicates from both queries
    const uniqueUsers = new Map();

    // loop through each array of users
    users.forEach((userList) => {
      userList.forEach((user) => {
        uniqueUsers.set(user._id, user);
      });
    });

    // convert the map back to an array
    const filteredUsers = Array.from(uniqueUsers.values());

    return filteredUsers;
  },
});

const updateUserCredits = mutation({
  args: {
    userId: v.id("users"),
    credits: v.object({
      total: v.number(),
      remaining: v.number(),
      used: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      credits: args.credits,
    });
  },
});

export {
  createUser,
  deleteUser,
  getUserByClerkId,
  getUserByStripeCustomerId,
  getUserById,
  getAllUsers,
  getSuggestedUsers,
  searchUsers,
  setOnlineStatus,
  searchCandidatesForInterview,
  updateUserCredits,
};
