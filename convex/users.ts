import { v } from "convex/values";
import { mutation } from "./_generated/server";

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
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    //   if user exists, return existing user
    if (existingUser) return existingUser._id;

    const userId = await ctx.db.insert("users", {
      username: args.username,
      email: args.email,
      image: args.image,
      clerkId: args.clerkId,
      stripeCustomerId: args.stripeCustomerId,
      role: args.role,
      companyName: args.companyName,
    });

    return userId;
  },
});

export { createUser };
