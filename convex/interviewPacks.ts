import { v } from "convex/values";
import { query } from "./_generated/server";

const getPackByKeyword = query({
  args: {
    keyword: v.union(
      v.literal("starter"),
      v.literal("professional"),
      v.literal("enterprise"),
      v.literal("unlimited")
    ),
  },
  handler: async (ctx, { keyword }) => {
    return await ctx.db
      .query("interviewPacks")
      .filter((q) => q.eq(q.field("keyword"), keyword))
      .first();
  },
});

const getPacks = query({
  handler: async (ctx) => {
    return await ctx.db.query("interviewPacks").collect();
  },
});

const getPackById = query({
  args: { packId: v.id("interviewPacks") },
  handler: async (ctx, { packId }) => {
    return await ctx.db.get(packId);
  },
});

export { getPackByKeyword, getPacks, getPackById };
