import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    // combine fields for candidate and recruiter
    username: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    email: v.string(),
    stripeCustomerId: v.string(),
    image: v.optional(v.string()),
    role: v.union(
      v.literal("candidate"),
      v.literal("recruiter"),
      v.literal("admin")
    ),
    clerkId: v.string(),

    // common fields - social media
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    github: v.optional(v.string()),
    linkedin: v.optional(v.string()),
    twitter: v.optional(v.string()),

    // admin only fields
    password: v.optional(v.string()),

    // candidate only fields
    resume: v.optional(v.string()),
    coverLetter: v.optional(v.string()),

    // recruiter only fields
    companyName: v.optional(v.string()),
    companyLogo: v.optional(v.string()),
    companyDescription: v.optional(v.string()),

    // chat fields
    isOnline: v.optional(v.boolean()),
    lastSeen: v.optional(v.number()),

    // subscription fields
    subscriptionId: v.optional(v.id("subscriptions")),
  })
    .index("by_username", ["username"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_stripe_customer_id", ["stripeCustomerId"])
    .searchIndex("by_search_username", {
      searchField: "username",
    })
    .searchIndex("by_search_email", {
      searchField: "email",
    }),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    type: v.union(
      v.literal("interview"),
      v.literal("system"),
      v.literal("reminder")
    ),
    action: v.optional(
      v.object({
        label: v.string(),
        url: v.string(),
      })
    ),
  })
    .index("by_user_id", ["userId"])
    .index("by_read", ["read"])
    .index("by_read_user_id", ["read", "userId"]),

  chatRequests: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("rejected")
    ),
  })
    .index("by_sender_id", ["senderId"])
    .index("by_receiver_id", ["receiverId"])
    .index("by_sender_id_receiver_id", ["senderId", "receiverId"])
    .index("by_status", ["status"])
    .index("by_receiver_id_status", ["receiverId", "status"]),

  chats: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
  }).index("by_sender_id_receiver_id", ["senderId", "receiverId"]),

  messages: defineTable({
    chatId: v.id("chats"),
    senderId: v.id("users"),
    message: v.string(),
    sendAt: v.number(),
    status: v.union(
      v.literal("sent"),
      v.literal("received"),
      v.literal("read")
    ),
  })
    .index("by_chat_id", ["chatId"])
    .index("by_status", ["status"]),

  interviews: defineTable({
    createdById: v.id("users"),
    createdByRole: v.union(v.literal("candidate"), v.literal("recruiter")),
    type: v.array(v.string()),
    duration: v.optional(v.number()),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    experience: v.number(),
    experienceIn: v.union(v.literal("years"), v.literal("months")),
    title: v.string(),
    role: v.string(),
    description: v.optional(v.string()),
    keywords: v.array(v.string()),
    topic: v.optional(v.string()),
    assessment: v.union(v.literal("voice"), v.literal("mcq")),
    numberOfQuestions: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("scheduled"),
      v.literal("created"),
      v.literal("expired")
    ),
    isScheduled: v.optional(v.boolean()),
    scheduledAt: v.optional(v.number()),
    jobId: v.optional(v.id("_scheduled_functions")), // job id for scheduled interviews
    validateTill: v.optional(v.number()), // unix timestamp
    category: v.union(v.literal("mock"), v.literal("job")),
    questions: v.array(
      v.object({
        question: v.string(),
        options: v.optional(v.array(v.string())),
        answer: v.optional(v.string()),
        explanation: v.optional(v.string()),
      })
    ),
  })
    .index("by_created_by_id", ["createdById"])
    .index("by_validate_till", ["validateTill"]),

  participants: defineTable({
    interviewId: v.id("interviews"),
    userId: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("scheduled")
    ),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),

    // additional fields for participants
    category: v.union(v.literal("mock"), v.literal("job")),

    // scheduled interview fields
    scheduledAt: v.optional(v.number()),
    isScheduled: v.optional(v.boolean()),
    jobId: v.optional(v.id("_scheduled_functions")), // job id for scheduled interviews
  })
    .index("by_interview_id", ["interviewId"])
    .index("by_user_id", ["userId"])
    .index("by_status", ["status"])
    .index("by_interview_and_user", ["interviewId", "userId"])
    .index("by_interview_id_and_completed_at", ["interviewId", "completedAt"]),

  feedbacks: defineTable({
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
  })
    .index("by_user_id", ["userId"])
    .index("by_interview_id", ["interviewId"])
    .index("by_user_interview", ["interviewId", "userId"]),

  subscriptions: defineTable({
    userId: v.id("users"),
    plan: v.union(v.literal("free"), v.literal("standard"), v.literal("pro")),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("expired")
    ),
    stripeSubscriptionId: v.optional(v.string()),
    cancelAtPeriodEnd: v.optional(v.boolean()),
  }).index("by_stripe_subscription_id", ["stripeSubscriptionId"]),

  planUsage: defineTable({
    userId: v.id("users"),
    plan: v.union(v.literal("free"), v.literal("standard"), v.literal("pro")),
    period: v.number(),
    interviews: v.object({
      total: v.number(),
      used: v.number(),
    }),
    aiBasedQuestions: v.number(),
    questionsPerInterview: v.number(),
    attemptsPerInterview: v.number(),
    candidatesPerInterview: v.number(),
  }).index("by_user_id", ["userId"]),
});
