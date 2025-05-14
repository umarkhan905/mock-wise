import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { type Interview } from "./types/index";

type Status =
  | "unauthorized"
  | "notFound"
  | "expired"
  | "alreadyAttempted"
  | "success";

const createParticipant = mutation({
  args: {
    interviewId: v.id("interviews"),
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
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
    const participants = await ctx.db
      .query("participants")
      .withIndex("by_interview_and_user", (q) =>
        q.eq("interviewId", args.interviewId).eq("userId", user._id)
      )
      .order("desc")
      .collect();

    const latest = participants[0];

    if (latest) {
      // Job Interviews
      if (interview.category === "job") {
        if (latest.status === "completed") {
          return {
            status: "alreadyAttempted",
            participantId: null,
            interview: null,
          };
        }
        if (latest.status === "pending") {
          return { status: "success", participantId: latest._id, interview };
        }
      }

      // Mock Interviews
      if (interview.category === "mock") {
        if (latest.status === "pending") {
          return { status: "success", participantId: latest._id, interview };
        }

        if (latest.status === "completed") {
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
    }

    // No participant yet — create first
    const participantId = await ctx.runMutation(
      api.participants.createParticipant,
      {
        interviewId: args.interviewId,
        userId: user._id,
        status: "pending",
        startedAt: Date.now(),
      }
    );

    return { status: "success", participantId, interview };
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

export {
  createParticipant,
  initiateParticipant,
  updateParticipantStatus,
  getInterviewParticipants,
  getUserInterviewParticipation,
};
