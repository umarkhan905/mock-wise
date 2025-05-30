import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { api } from "./_generated/api";

const canCreateInterviews = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<boolean> => {
    const usage = await ctx.runQuery(api.usage.getUserUsage, {
      userId: args.userId,
    });

    if (!usage) {
      throw new ConvexError("Plan not found.");
    }

    return usage.interviews.used < usage.interviews.total;
  },
});

export { canCreateInterviews };
