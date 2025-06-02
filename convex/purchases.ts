import { v } from "convex/values";
import { mutation } from "./_generated/server";

const createPurchase = mutation({
  args: {
    userId: v.id("users"),
    interviewPackId: v.optional(v.id("interviewPacks")),
    title: v.string(),
    description: v.string(),
    purchaseDate: v.number(),
    amount: v.number(),
    stripePurchaseId: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("purchases", args);
  },
});

export { createPurchase };
