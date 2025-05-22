import { ConvexError } from "convex/values";
import { query } from "./_generated/server";
import { api } from "./_generated/api";
import { InterviewType } from "./types/index";

type Interview = InterviewType & { rating: number };

const getCandidateStats = query({
  handler: async (
    ctx
  ): Promise<{
    job: number;
    mock: number;
    total: number;
    user: any;
    recent: Interview[];
  }> => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Unauthorized: must be signed in");
    }

    const user = await ctx.runQuery(api.users.getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new ConvexError("User not found");
    }

    const [mockInterviews, jobInterviews] = await Promise.all([
      ctx.db
        .query("interviews")
        .withIndex("by_created_by_id", (q) => q.eq("createdById", user._id))
        .order("desc")
        .collect(),
      ctx.db
        .query("participants")
        .withIndex("by_user_id", (q) => q.eq("userId", user._id))
        .order("desc")
        .collect(),
    ]);

    const total = mockInterviews.length + jobInterviews.length;

    const recentMockInterviews = mockInterviews.slice(0, 5);

    const recent: Interview[] = await Promise.all(
      recentMockInterviews.map(async (interview) => {
        const feedbacks = await ctx.db
          .query("feedbacks")
          .withIndex("by_interview_id", (q) =>
            q.eq("interviewId", interview._id)
          )
          .collect();

        const rating =
          feedbacks.length > 0
            ? feedbacks.reduce((sum, f) => sum + (f.totalRating || 0), 0) /
              feedbacks.length
            : 0;

        return {
          ...interview,
          rating,
        };
      })
    );

    return {
      job: jobInterviews.length,
      mock: mockInterviews.length,
      total,
      user,
      recent,
    };
  },
});

// TODO: add practice hours, and upcoming interviews count

export { getCandidateStats };
