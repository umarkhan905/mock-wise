import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

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

    const interviewId = await ctx.db.insert("interviews", {
      createdById: args.createdById,
      createdByRole: "recruiter",
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
      category: "job",
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

export {
  createJobInterview,
  getInterviewById,
  updateJobInterview,
  updateQuestions,
};
