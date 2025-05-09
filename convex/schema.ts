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
  })
    .index("by_username", ["username"])
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_stripe_customer_id", ["stripeCustomerId"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
  }).index("by_user_id", ["userId"]),

  messages: defineTable({
    senderId: v.id("users"),
    receiverId: v.id("users"),
    message: v.string(),
    status: v.union(
      v.literal("sent"),
      v.literal("received"),
      v.literal("read")
    ),
  })
    .index("by_sender_id", ["senderId"])
    .index("by_receiver_id", ["receiverId"]),

  interviews: defineTable({
    createdById: v.id("users"),
    createdByRole: v.union(v.literal("candidate"), v.literal("recruiter")),
    type: v.string(),
    duration: v.number(),
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
    numberOfQuestions: v.number(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("created"),
      v.literal("expired")
    ),
    isScheduled: v.boolean(),
    validateTill: v.number(), // unix timestamp
    category: v.union(v.literal("mock"), v.literal("job")),
    questions: v.array(
      v.object({
        question: v.string(),
        questionType: v.string(),
        codeEditor: v.boolean(),
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
      v.literal("completed")
    ),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_interview_id", ["interviewId"])
    .index("by_user_id", ["userId"]),

  feedbacks: defineTable({
    userId: v.id("users"),
    interviewId: v.id("interviews"),
    rating: v.number(),
    summary: v.string(),
    stregnts: v.string(),
    weaknesses: v.string(),
    improvements: v.string(),
    assessment: v.string(),
    recommendedForJob: v.boolean(),
    ratingItem: v.array(
      v.object({
        name: v.string(),
        score: v.number(),
        comment: v.string(),
      })
    ),
  })
    .index("by_user_id", ["userId"])
    .index("by_interview_id", ["interviewId"]),
});
