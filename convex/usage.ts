import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

const getUserUsage = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("planUsage")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
  },
});

const createPlanUsage = mutation({
  args: {
    userId: v.id("users"),
    plan: v.union(v.literal("free"), v.literal("standard"), v.literal("pro")),
    interviews: v.object({ used: v.number(), total: v.number() }),
    aiBasedQuestions: v.number(),
    questionsPerInterview: v.number(),
    attemptsPerInterview: v.number(),
    candidatesPerInterview: v.number(),
    period: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("planUsage", args);
  },
});

const decrementInterviews = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }): Promise<void> => {
    const usage = await ctx.runQuery(api.usage.getUserUsage, { userId });

    if (!usage) {
      throw new ConvexError("Plan not found.");
    }

    return await ctx.db.patch(usage._id, {
      interviews: {
        total: usage.interviews.total - 1, // decrement total
        used: usage.interviews.used + 1, // increment used
      },
    });
  },
});

const updateUserInterviewCredits = mutation({
  args: {
    userId: v.id("users"),
    interviewCredits: v.number(),
  },
  handler: async (ctx, args): Promise<void> => {
    const usage = await ctx.runQuery(api.usage.getUserUsage, {
      userId: args.userId,
    });

    if (!usage) {
      throw new ConvexError("Plan not found.");
    }

    const oldInterviewCredits = usage.interviews.total;
    const oldInterviewsUsed = usage.interviews.used;

    return await ctx.db.patch(usage._id, {
      interviews: {
        total: oldInterviewCredits + args.interviewCredits,
        used: oldInterviewsUsed,
      },
    });
  },
});

export {
  getUserUsage,
  createPlanUsage,
  decrementInterviews,
  updateUserInterviewCredits,
};
