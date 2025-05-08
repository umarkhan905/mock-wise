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
});
