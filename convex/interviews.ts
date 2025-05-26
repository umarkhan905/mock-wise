import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";

const createJobInterview = mutation({
  args: {
    createdById: v.id("users"),
    title: v.string(),
    role: v.string(),
    description: v.optional(v.string()),
    type: v.array(v.string()),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    experience: v.number(),
    experienceIn: v.union(v.literal("years"), v.literal("months")),
    keywords: v.array(v.string()),
    assessment: v.union(v.literal("voice"), v.literal("mcq")),
    category: v.union(v.literal("mock"), v.literal("job")),
    createdByRole: v.union(v.literal("candidate"), v.literal("recruiter")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Unauthorized: must be signed in");
    }

    const user = await ctx.db.get(args.createdById);

    if (!user) {
      throw new ConvexError("User not found");
    }

    console.log("***args***", args);

    const interviewId = await ctx.db.insert("interviews", {
      createdById: args.createdById,
      createdByRole: args.createdByRole,
      title: args.title,
      role: args.role,
      description: args.description,
      type: args.type,
      difficulty: args.difficulty,
      experience: args.experience,
      experienceIn: args.experienceIn,
      keywords: args.keywords,
      assessment: args.assessment,
      status: "pending",
      category: args.category,
      questions: [],
    });

    return interviewId;
  },
});

const updateJobInterview = mutation({
  args: {
    interviewId: v.id("interviews"),
    title: v.string(),
    role: v.string(),
    description: v.optional(v.string()),
    type: v.array(v.string()),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    experience: v.number(),
    experienceIn: v.union(v.literal("years"), v.literal("months")),
    keywords: v.array(v.string()),
  },
  handler: async (ctx, args) => {
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

    const interviewId = await ctx.db.patch(args.interviewId, {
      title: args.title,
      role: args.role,
      description: args.description,
      type: args.type,
      difficulty: args.difficulty,
      experience: args.experience,
      experienceIn: args.experienceIn,
      keywords: args.keywords,
    });

    return interviewId;
  },
});

const updateQuestions = mutation({
  args: {
    interviewId: v.id("interviews"),
    questions: v.array(
      v.object({
        question: v.string(),
        options: v.optional(v.array(v.string())),
        answer: v.optional(v.string()),
        explanation: v.optional(v.string()),
      })
    ),
    numberOfQuestions: v.optional(v.number()),
    duration: v.optional(v.number()),
    validateTill: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
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

    const interviewId = await ctx.db.patch(args.interviewId, {
      questions: args.questions,
      status: "created",
      numberOfQuestions: args.numberOfQuestions,
      duration: args.duration,
      validateTill: args.validateTill,
    });

    return interviewId;
  },
});

const getInterviewById = query({
  args: {
    interviewId: v.id("interviews"),
  },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.interviewId);
    return interview;
  },
});

const scheduleInterview = mutation({
  args: {
    interviewId: v.id("interviews"),
    scheduledAt: v.number(),
    isScheduled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
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

    // un-schedule an interview when it reaches the scheduled time
    const jobId = await ctx.scheduler.runAt(
      args.scheduledAt,
      internal.interviews.autoUnscheduleInterview,
      {
        interviewId: args.interviewId,
      }
    );

    await ctx.db.patch(args.interviewId, {
      status: "scheduled",
      scheduledAt: args.scheduledAt,
      isScheduled: args.isScheduled,
      jobId,
    });
  },
});

const autoUnscheduleInterview = internalMutation({
  args: {
    interviewId: v.id("interviews"),
  },
  handler: async (ctx, args) => {
    const interviewId = await ctx.db.patch(args.interviewId, {
      status: "created",
      scheduledAt: undefined,
      isScheduled: false,
    });

    return interviewId;
  },
});

const unScheduleInterview = mutation({
  args: {
    interviewId: v.id("interviews"),
    jobId: v.id("_scheduled_functions"),
  },
  handler: async (ctx, args) => {
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

    const interviewId = await ctx.db.patch(args.interviewId, {
      status: "pending",
      scheduledAt: undefined,
      isScheduled: false,
      jobId: undefined,
    });

    await ctx.scheduler.cancel(args.jobId);

    return interviewId;
  },
});

const createTopicInterview = mutation({
  args: {
    createdById: v.id("users"),
    title: v.string(),
    type: v.array(v.string()),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    topic: v.string(),
  },
  handler: async (ctx, args) => {
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

    const interviewId = await ctx.db.insert("interviews", {
      createdById: args.createdById,
      createdByRole: "candidate",
      type: args.type,
      difficulty: args.difficulty,
      experience: 0,
      experienceIn: "months",
      title: args.title,
      role: "",
      topic: args.topic,
      assessment: "voice",
      status: "pending",
      category: "mock",
      questions: [],
      keywords: [],
    });

    return interviewId;
  },
});

const updateTopicInterview = mutation({
  args: {
    interviewId: v.id("interviews"),
    title: v.string(),
    type: v.array(v.string()),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    topic: v.string(),
  },
  handler: async (ctx, args) => {
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

    const interviewId = await ctx.db.patch(args.interviewId, {
      type: args.type,
      difficulty: args.difficulty,
      title: args.title,
      topic: args.topic,
    });

    return interviewId;
  },
});

const updateFinish = mutation({
  args: {
    interviewId: v.id("interviews"),
    description: v.string(),
    keywords: v.array(v.string()),
  },
  handler: async (ctx, args) => {
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

    const interviewId = await ctx.db.patch(args.interviewId, {
      description: args.description,
      keywords: args.keywords,
    });

    return interviewId;
  },
});

export {
  createJobInterview,
  getInterviewById,
  updateJobInterview,
  updateQuestions,
  autoUnscheduleInterview,
  scheduleInterview,
  unScheduleInterview,
  createTopicInterview,
  updateTopicInterview,
  updateFinish,
};
