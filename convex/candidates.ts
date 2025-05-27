import { ConvexError, v } from "convex/values";
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
        .filter((q) => q.eq(q.field("category"), "job"))
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

const getCandidateMockInterviews = query({
  args: {
    userId: v.id("users"),
    difficulty: v.optional(v.string()),
    experience: v.optional(v.string()),
    orderBy: v.optional(v.union(v.literal("desc"), v.literal("asc"))),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("interviews")
      .withIndex("by_created_by_id", (q) => q.eq("createdById", args.userId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    if (args.difficulty) {
      query = query.filter((q) => q.eq(q.field("difficulty"), args.difficulty));
    }

    if (args.experience) {
      query = query.filter((q) =>
        q.eq(q.field("experienceIn"), args.experience)
      );
    }

    const interviews = await query.order(args.orderBy || "desc").collect();

    return interviews;
  },
});

const getCandidateJobInterviews = query({
  args: {
    userId: v.id("users"),
    status: v.optional(v.string()),
    assessment: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    experienceIn: v.optional(v.string()),
    orderBy: v.optional(v.union(v.literal("desc"), v.literal("asc"))),
  },
  handler: async (ctx, args) => {
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("category"), "job"))
      .collect();

    // unique interview ids
    const interviewIds = new Set(participants.map((p) => p.interviewId));

    // fetch all interviews
    const interviews = await Promise.all(
      Array.from(interviewIds).map((id) =>
        ctx.db
          .query("interviews")
          .withIndex("by_id", (q) => q.eq("_id", id))
          .filter((q) =>
            q.and(
              q.eq(q.field("category"), "job"),
              args.status ? q.eq(q.field("status"), args.status) : true,
              args.assessment
                ? q.eq(q.field("assessment"), args.assessment)
                : true,
              args.difficulty
                ? q.eq(q.field("difficulty"), args.difficulty)
                : true,
              args.experienceIn
                ? q.eq(q.field("experienceIn"), args.experienceIn)
                : true
            )
          )
          .unique()
      )
    );

    // filter out null
    const filteredInterviews = interviews.filter((i) => i !== null);

    // sort
    if (args.orderBy) {
      switch (args.orderBy) {
        case "asc":
          filteredInterviews.sort((a, b) => a._creationTime - b._creationTime);
          break;

        default:
          filteredInterviews.sort((a, b) => b._creationTime - a._creationTime);
          break;
      }
    }

    return filteredInterviews;
  },
});

const getUpcomingInterviews = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "scheduled"),
          q.eq(q.field("isScheduled"), true),
          q.eq(q.field("category"), "job")
        )
      )
      .collect();

    const upcomingInterviews = await Promise.all(
      participants.map((p) => ctx.db.get(p.interviewId))
    );

    return upcomingInterviews.filter((i) => i !== null);
  },
});

export {
  getCandidateStats,
  getCandidateMockInterviews,
  getCandidateJobInterviews,
  getUpcomingInterviews,
};
