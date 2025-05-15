import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const createFeedback = mutation({
  args: {
    userId: v.id("users"),
    interviewId: v.id("interviews"),
    participantId: v.id("participants"),
    totalRating: v.number(),
    summary: v.string(),
    strengths: v.string(),
    weaknesses: v.string(),
    improvements: v.string(),
    assessment: v.string(),
    recommendedForJob: v.boolean(),
    recommendationReason: v.optional(v.string()),
    rating: v.array(
      v.object({
        name: v.string(),
        score: v.number(),
        comment: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("feedbacks", args);
  },
});

const getFeedbackById = query({
  args: {
    id: v.id("feedbacks"),
  },
  handler: async (ctx, args) => {
    const feedback = await ctx.db.get(args.id);
    const interview = await ctx.db.get(
      feedback?.interviewId as Id<"interviews">
    );
    return { feedback, interview };
  },
});

export { createFeedback, getFeedbackById };
