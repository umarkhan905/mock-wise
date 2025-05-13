import { v } from "convex/values";
import { mutation } from "./_generated/server";

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
        name: v.union(
          v.literal("Communication Skills"),
          v.literal("Technical Knowledge"),
          v.literal("Problem-Solving"),
          v.literal("Cultural & Role Fit"),
          v.literal("Confidence & Clarity"),
          v.literal("Experience"),
          v.literal("Presentation Skills")
        ),
        score: v.number(),
        comment: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("feedbacks", args);
  },
});

export { createFeedback };
