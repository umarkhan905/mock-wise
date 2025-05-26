import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { api } from "./_generated/api";
import { InterviewType } from "./types";

const getRecruiterStats = query({
  handler: async (
    ctx
  ): Promise<{
    total: number;
    scheduled: number;
    evaluated: number;
    monthly: number;
    user: any;
    recent: InterviewType[];
    scheduledInterviews: InterviewType[];
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

    const now = new Date();
    const endOf7Days = new Date(now);
    endOf7Days.setDate(now.getDate() + 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get all interviews created by the recruiter
    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_created_by_id", (q) => q.eq("createdById", user._id))
      .order("desc")
      .collect();

    const total = interviews.length;

    // Scheduled in next 7 days
    const scheduled = interviews.filter((i) => {
      const scheduledDate = i.scheduledAt && new Date(i.scheduledAt);
      return (
        i.isScheduled &&
        scheduledDate &&
        scheduledDate >= now &&
        scheduledDate <= endOf7Days
      );
    });

    // Monthly interviews
    const monthlyInterviews = interviews.filter((i) => {
      const createdDate = new Date(i._creationTime);
      return createdDate >= startOfMonth && createdDate <= endOfMonth;
    });

    const monthlyInterviewCount = monthlyInterviews.length;
    const monthlyInterviewIds = monthlyInterviews.map((i) => i._id);

    // Now fetch only participants for those interviews
    const participantsPromises = monthlyInterviewIds.map((interviewId) =>
      ctx.db
        .query("participants")
        .withIndex("by_interview_id_and_completed_at", (q) =>
          q
            .eq("interviewId", interviewId)
            .gte("completedAt", startOfMonth.getTime())
            .lte("completedAt", endOfMonth.getTime())
        )
        .collect()
    );

    const participantsArrays = await Promise.all(participantsPromises);
    const evaluated = participantsArrays.flat().length;

    const recent = interviews.filter((i) => !i.isScheduled).slice(0, 5);

    return {
      total,
      monthly: monthlyInterviewCount,
      scheduled: scheduled.length,
      evaluated,
      user,
      recent,
      scheduledInterviews: scheduled.slice(0, 5),
    };
  },
});

const getInterviews = query({
  args: {
    userId: v.id("users"),
    status: v.optional(v.string()),
    assessment: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    experience: v.optional(v.string()),
    orderBy: v.optional(v.union(v.literal("desc"), v.literal("asc"))),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("interviews")
      .withIndex("by_created_by_id", (q) => q.eq("createdById", args.userId));

    if (args.assessment) {
      query = query.filter((q) => q.eq(q.field("assessment"), args.assessment));
    }

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

export { getRecruiterStats, getInterviews };
