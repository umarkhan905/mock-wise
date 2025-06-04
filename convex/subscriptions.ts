import { action, mutation, query } from "./_generated/server";
import { stripe } from "../src/lib/stripe";
import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api";
import { getCreditsForPlan } from "../src/utils/subscriptions";
import { type Subscription } from "./types";

const createFreeSubscription = mutation({
  args: {
    userId: v.id("users"),
  },

  handler: async (ctx, args) => {
    const now = Date.now();
    const date = new Date(now);
    date.setMonth(date.getMonth() + 1);

    const subscriptionId = await ctx.db.insert("subscriptions", {
      userId: args.userId,
      currentPeriodStart: now,
      currentPeriodEnd: date.getTime(),
      plan: "free",
      status: "active",
    });

    return subscriptionId;
  },
});

const upsertSubscription = mutation({
  args: {
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("expired")
    ),
    plan: v.union(v.literal("free"), v.literal("standard"), v.literal("pro")),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(api.users.getUserByStripeCustomerId, {
      stripeCustomerId: args.stripeCustomerId,
    });

    if (!user) {
      throw new ConvexError(
        `User not found for stripe customer id: ${args.stripeCustomerId}`
      );
    }

    const existingSubscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .unique();

    if (existingSubscription) {
      await ctx.db.patch(existingSubscription._id, {
        stripeSubscriptionId: args.stripeSubscriptionId,
        status: args.status,
        plan: args.plan,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      });

      // Check if user is upgrading
      const planUpgrade =
        args.plan !== existingSubscription.plan &&
        (args.plan === "pro" || args.plan === "standard");

      if (planUpgrade) {
        const additionalCredits = getCreditsForPlan(args.plan);
        await ctx.db.patch(user._id, {
          credits: {
            total: (user.credits?.total || 0) + additionalCredits,
            used: user.credits?.used || 0,
            remaining: (user.credits?.remaining || 0) + additionalCredits,
          },
        });
      }
    } else {
      // create a new subscription
      await ctx.db.insert("subscriptions", {
        userId: user._id,
        stripeSubscriptionId: args.stripeSubscriptionId,
        status: args.status,
        plan: args.plan,
        currentPeriodStart: args.currentPeriodStart,
        currentPeriodEnd: args.currentPeriodEnd,
        cancelAtPeriodEnd: args.cancelAtPeriodEnd,
      });

      // update user credits and subscriptionId
      const additionalCredits = getCreditsForPlan(args.plan);
      await ctx.db.patch(user._id, {
        credits: {
          total: (user.credits?.total || 0) + additionalCredits,
          used: user.credits?.used || 0,
          remaining: (user.credits?.remaining || 0) + additionalCredits,
        },
      });
    }

    return { success: true };
  },
});

const getUserSubscription = query({
  handler: async (ctx): Promise<Subscription> => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Unauthorized: must be signed in.");
    }

    const user = await ctx.runQuery(api.users.getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new ConvexError("User not found.");
    }

    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .unique();

    if (!subscription) {
      throw new ConvexError("Subscription not found.");
    }

    return subscription;
  },
});

const downgradeUserSubscription = action({
  args: {
    stripeSubscriptionId: v.string(),
    nextPlan: v.union(
      v.literal("free"),
      v.literal("standard"),
      v.literal("pro")
    ),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.runQuery(
      api.subscriptions.getUserSubscription
    );

    if (!subscription) {
      throw new ConvexError("Subscription not found.");
    }

    await Promise.all([
      ctx.runMutation(api.subscriptions.saveNextPlan, {
        subscriptionId: subscription._id,
        nextPlan: args.nextPlan,
      }),
      stripe.subscriptions.update(args.stripeSubscriptionId, {
        cancel_at_period_end: true,
      }),
    ]);
  },
});

const resubscribeToCurrentPlan = action({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.runQuery(
      api.subscriptions.getUserSubscription
    );

    if (!subscription) {
      throw new ConvexError("Subscription not found.");
    }

    await Promise.all([
      ctx.runMutation(api.subscriptions.saveNextPlan, {
        subscriptionId: subscription._id,
        nextPlan: undefined,
      }),
      stripe.subscriptions.update(args.stripeSubscriptionId, {
        cancel_at_period_end: false,
      }),
    ]);
  },
});

const resetSubscription = mutation({
  args: {
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripe_subscription_id", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId)
      )
      .unique();

    if (!subscription) {
      throw new ConvexError("Subscription not found.");
    }

    const now = Date.now();
    const date = new Date(now);
    date.setMonth(date.getMonth() + 1);

    return await ctx.db.patch(subscription._id, {
      plan: "free",
      nextPlan: undefined,
      cancelAtPeriodEnd: false,
      currentPeriodStart: now,
      currentPeriodEnd: date.getTime(),
      status: "active",
      stripeSubscriptionId: undefined,
    });
  },
});

const saveNextPlan = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    nextPlan: v.optional(
      v.union(v.literal("free"), v.literal("standard"), v.literal("pro"))
    ),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.subscriptionId, {
      nextPlan: args.nextPlan,
      cancelAtPeriodEnd: args.cancelAtPeriodEnd,
    });
  },
});

const addNextSubscription = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    stripeSubscriptionId: v.string(),
    plan: v.union(v.literal("free"), v.literal("standard"), v.literal("pro")),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.subscriptionId, {
      plan: args.plan,
      currentPeriodStart: args.currentPeriodStart,
      currentPeriodEnd: args.currentPeriodEnd,
      stripeSubscriptionId: args.stripeSubscriptionId,
      status: "active",
      nextPlan: undefined,
      cancelAtPeriodEnd: false,
    });
  },
});

export {
  createFreeSubscription,
  upsertSubscription,
  getUserSubscription,
  resetSubscription,
  saveNextPlan,
  downgradeUserSubscription,
  resubscribeToCurrentPlan,
  addNextSubscription,
};
