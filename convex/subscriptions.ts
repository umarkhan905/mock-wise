import { v } from "convex/values";
import { mutation } from "./_generated/server";

const createFreeSubscription = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);

    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: args.userId,
      currentPeriodStart: Date.now(),
      currentPeriodEnd: date.getTime(),
      plan: "free",
      status: "active",
    });

    return subscriptionId;
  },
});

export { createFreeSubscription };
