import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { type Interview } from "./types/index";
import { PLAN_LIMITS } from "../src/utils/subscriptions";

type Status =
  | "unauthorized"
  | "notFound"
  | "expired"
  | "alreadyAttempted"
  | "success"
  | "scheduled"
  | "notInterviewCandidate"
  | "attemptReached";

const addCandidateToInterview = mutation({
  args: {
    interviewId: v.id("interviews"),
    userId: v.id("users"),
    scheduledAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existingParticipant = await ctx.db
      .query("participants")
      .withIndex("by_interview_and_user", (q) =>
        q.eq("interviewId", args.interviewId).eq("userId", args.userId)
      )
      .filter((q) => q.eq(q.field("category"), "job"))
      .unique();

    // If participant already exists, return existing participant ID
    if (existingParticipant) {
      return existingParticipant._id;
    }

    // TODO: send notification and email to user about the new interview

    // If not, create a new participant
    const participantId = await ctx.db.insert("participants", {
      interviewId: args.interviewId,
      userId: args.userId,
      category: "job",
      scheduledAt: args.scheduledAt,
      isScheduled: true,
      status: "scheduled",
    });

    // auto unschedule the candidate after scheduledAt reached current time
    const jobId = await ctx.scheduler.runAt(
      args.scheduledAt,
      internal.participants.autoUnscheduleCandidate,
      {
        participantId,
      }
    );

    // Patch the participant with the jobId for auto un-scheduling
    await ctx.db.patch(participantId, {
      jobId,
    });

    // Return the newly created participant ID
    return participantId;
  },
});

const autoUnscheduleCandidate = internalMutation({
  args: {
    participantId: v.id("participants"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.participantId, {
      isScheduled: false,
      scheduledAt: undefined,
      status: "pending",
      jobId: undefined, // Clear the jobId as it's no longer scheduled
    });
  },
});

const getScheduledParticipants = query({
  args: {
    interviewId: v.id("interviews"),
  },
  handler: async (ctx, args) => {
    // Fetch all participants
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_interview_id", (q) =>
        q.eq("interviewId", args.interviewId)
      )
      .collect();

    // Fetch all candidates based on candidateIds
    const candidateIds = participants.map((p) => p.userId);
    const candidates = await Promise.all(
      candidateIds.map((id) => ctx.db.get(id))
    );

    const candidateDetails = participants.map((participant) => {
      const candidate = candidates.find(
        (c) => c && c._id === participant.userId
      );
      return { ...participant, candidate };
    });

    return candidateDetails;
  },
});

const createParticipant = mutation({
  args: {
    interviewId: v.id("interviews"),
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("scheduled")
    ),
    startedAt: v.optional(v.number()),
    category: v.union(v.literal("mock"), v.literal("job")),
    scheduledAt: v.optional(v.number()),
    isScheduled: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("participants", args);
  },
});

const initiateParticipant = mutation({
  args: {
    interviewId: v.id("interviews"),
    userId: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    status: Status;
    participantId: Id<"participants"> | null;
    interview: Interview;
  }> => {
    const user = await ctx.runQuery(api.users.getUserByClerkId, {
      clerkId: args.userId,
    });

    if (!user) {
      return { status: "unauthorized", participantId: null, interview: null };
    }

    const interview = await ctx.db.get(args.interviewId);
    if (!interview) {
      return { status: "notFound", participantId: null, interview: null };
    }

    // Check if expired
    if (interview.validateTill && interview.validateTill < Date.now()) {
      if (interview.status !== "expired") {
        await ctx.db.patch(interview._id, { status: "expired" });
      }
      return { status: "expired", participantId: null, interview: null };
    }

    // Fetch all participants for user+interview, sorted by latest first
    const [participants, subscription] = await Promise.all([
      ctx.db
        .query("participants")
        .withIndex("by_interview_and_user", (q) =>
          q.eq("interviewId", args.interviewId).eq("userId", user._id)
        )
        .order("desc")
        .collect(),
      ctx.runQuery(api.subscriptions.getSubscriptionByUserId, {
        userId: user._id,
      }),
    ]);

    const latest = participants[0];
    const plan = PLAN_LIMITS[subscription?.plan || "free"];

    if (interview.category === "job") {
      // user is not interview candidate
      if (!latest) {
        return {
          status: "notInterviewCandidate",
          participantId: null,
          interview: null,
        };
      }

      // check if interview is scheduled
      if (latest.status === "scheduled") {
        return {
          status: "scheduled",
          participantId: latest._id,
          interview: interview,
        };
      }

      // check if interview is completed
      if (latest.status === "completed") {
        return {
          status: "alreadyAttempted",
          participantId: null,
          interview: null,
        };
      }

      // check if interview is pending
      if (latest.status === "pending") {
        return { status: "success", participantId: latest._id, interview };
      }
    }

    if (interview.category === "mock") {
      // No participant yet — create first
      if (!latest) {
        const participantId = await ctx.runMutation(
          api.participants.createParticipant,
          {
            interviewId: args.interviewId,
            userId: user._id,
            status: "pending",
            category: "mock",
          }
        );

        return { status: "success", participantId, interview };
      }

      // check if user is already in pending state
      if (latest.status === "pending") {
        return { status: "success", participantId: latest._id, interview };
      }

      if (latest.status === "completed") {
        // Check if number of attempts has been reached
        if (plan.attemptsPerInterview === participants.length) {
          return {
            status: "attemptReached",
            participantId: null,
            interview: null,
          };
        }

        // Only create new if no active pending participant
        const anyPending = participants.find((p) => p.status === "pending");
        if (!anyPending) {
          const newParticipantId = await ctx.runMutation(
            api.participants.createParticipant,
            {
              interviewId: args.interviewId,
              userId: user._id,
              status: "pending",
              startedAt: Date.now(),
              category: "mock",
            }
          );

          return {
            status: "success",
            participantId: newParticipantId,
            interview,
          };
        } else {
          return {
            status: "success",
            participantId: anyPending._id,
            interview,
          };
        }
      }
    }

    return { status: "notFound", participantId: null, interview: null };
  },
});

const updateParticipantStatus = mutation({
  args: {
    participantId: v.id("participants"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return ctx.db.patch(args.participantId, {
      status: args.status,
      completedAt: args.completedAt,
    });
  },
});

const getInterviewParticipants = query({
  args: {
    interviewId: v.id("interviews"),
  },
  handler: async (ctx, args) => {
    // Fetch all participants
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_interview_id", (q) =>
        q.eq("interviewId", args.interviewId)
      )
      .collect();

    // Fetch all users based on userIds
    const userIds = participants.map((p) => p.userId);
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));

    // Fetch feedbacks for this interview
    const feedbacks = await ctx.db
      .query("feedbacks")
      .withIndex("by_interview_id", (q) =>
        q.eq("interviewId", args.interviewId)
      )
      .collect();

    // Map participants with corresponding user
    const participantDetails = participants.map((participant) => {
      const user = users.find((u) => u && u._id === participant.userId);
      const feedback = feedbacks.find(
        (f) => f.participantId === participant._id
      );
      return {
        participant,
        user,
        feedback,
      };
    });

    return participantDetails;
  },
});

const getUserInterviewParticipation = query({
  args: {
    interviewId: v.id("interviews"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Fetch all participants
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_interview_and_user", (q) =>
        q.eq("interviewId", args.interviewId).eq("userId", args.userId)
      )
      .collect();

    // Fetch all users based on userIds
    const userIds = participants.map((p) => p.userId);
    const users = await Promise.all(userIds.map((id) => ctx.db.get(id)));

    // Fetch feedbacks for this interview
    const feedbacks = await ctx.db
      .query("feedbacks")
      .withIndex("by_interview_id", (q) =>
        q.eq("interviewId", args.interviewId)
      )
      .collect();

    // Map participants with corresponding user
    const participantDetails = participants.map((participant) => {
      const user = users.find((u) => u && u._id === participant.userId);
      const feedback = feedbacks.find(
        (f) => f.participantId === participant._id
      );
      return {
        participant,
        user,
        feedback,
      };
    });

    return participantDetails;
  },
});

const removeCandidateFromInterview = mutation({
  args: {
    interviewId: v.id("interviews"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const candidate = await ctx.db
      .query("participants")
      .withIndex("by_interview_and_user", (q) =>
        q.eq("interviewId", args.interviewId).eq("userId", args.userId)
      )
      .unique();

    if (!candidate) {
      return null;
    }

    // If the candidate is scheduled, cancel the job
    if (candidate.isScheduled && candidate.jobId) {
      await ctx.scheduler.cancel(candidate.jobId);
    }

    // Delete the participant
    return ctx.db.delete(candidate._id);
  },
});

const updateCandidateScheduledAt = mutation({
  args: {
    participantId: v.id("participants"),
    scheduledAt: v.number(),
    jobId: v.id("_scheduled_functions"),
  },
  handler: async (ctx, args): Promise<void> => {
    const jobIds = await Promise.all([
      ctx.scheduler.cancel(args.jobId), // cancel existing job if any
      // auto unschedule the candidate after scheduledAt reached current time
      ctx.scheduler.runAt(
        args.scheduledAt,
        internal.participants.autoUnscheduleCandidate,
        {
          participantId: args.participantId,
        }
      ),
    ]);

    // Patch the participant with new scheduledAt and jobId
    return ctx.db.patch(args.participantId, {
      scheduledAt: args.scheduledAt,
      jobId: jobIds[1],
    });
  },
});

const inviteCandidateToInterview = mutation({
  args: {
    interviewId: v.id("interviews"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existingParticipant = await ctx.db
      .query("participants")
      .withIndex("by_interview_and_user", (q) =>
        q.eq("interviewId", args.interviewId).eq("userId", args.userId)
      )
      .filter((q) => q.eq(q.field("category"), "job"))
      .unique();

    // If participant already exists, return existing participant ID
    if (existingParticipant) {
      return existingParticipant._id;
    }

    // TODO: send notification and email to user about the new interview

    // If not, create a new participant
    const participantId = await ctx.db.insert("participants", {
      interviewId: args.interviewId,
      userId: args.userId,
      category: "job",
      status: "pending",
    });

    return participantId;
  },
});

export {
  createParticipant,
  initiateParticipant,
  updateParticipantStatus,
  getInterviewParticipants,
  getUserInterviewParticipation,
  addCandidateToInterview,
  getScheduledParticipants,
  removeCandidateFromInterview,
  updateCandidateScheduledAt,
  autoUnscheduleCandidate,
  inviteCandidateToInterview,
};
