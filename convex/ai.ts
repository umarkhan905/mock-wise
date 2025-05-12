import { ConvexError, v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { google } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import { z } from "zod";

const generateDescription = action({
  args: {
    title: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Unauthorized: must be signed in.");
    }

    const user = await ctx.runQuery(api.users.getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new ConvexError("User not found.");
    }
    // TODO: Apply rate limiting

    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: z.object({
        description: z.string(),
      }),
      prompt: `Generate a professional and concise job description for the position titled "${args.title}" under the role "${args.role}". Do no add any additional text except the description.
      `,

      system:
        "You are an AI job description generator. Your task is to generate the description based on title and role provided by the user.",
    });

    return object.description;
  },
});

const generateMCQBasedQuestions = action({
  args: {
    numberOfQuestions: v.number(),
    title: v.string(),
    role: v.string(),
    description: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    experience: v.number(),
    experienceIn: v.union(v.literal("years"), v.literal("months")),
    keywords: v.array(v.string()),
    assessment: v.union(v.literal("voice"), v.literal("mcq")),
    type: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Unauthorized: must be signed in.");
    }

    const user = await ctx.runQuery(api.users.getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new ConvexError("User not found.");
    }
    // TODO: Apply rate limiting

    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: `
      Generate ${args.numberOfQuestions} interview questions for the role of a "${args.role}".

    Details for context:
    - **Title**: ${args.title}
    - **Description**: ${args.description}
    - **Difficulty**: ${args.difficulty}  
    - **Experience Required**: ${args.experience} ${args.experienceIn} 
    - **Keywords/Technologies**: ${args.keywords.join(",")} (comma-separated) 
    - **Assessment Type**: ${args.assessment}
    - **Question Types**: ${args.type.join(",")} (comma-separated)  

    Format:
    - Each question should be in the following format:
      - **question**: question
      - **options**: [option1, option2, option3, option4]
      - **answer**: option1
      - **explanation**: explanation

    Instructions:
    - The questions must match the role, difficulty level, and required experience.
    - Base the content around the listed keywords and technologies.
    - Use only the specified question types (e.g., coding, technical, behavioral).
    - Format each question appropriately based on the assessment type.
    - Don't add any additional text with questions or options except the given format.`,
      system:
        "You are an expert technical interviewer. Your task is to generate interview questions based on the provided job details.",
    });

    return questions;
  },
});

const generateVoiceBasedQuestions = action({
  args: {
    numberOfQuestions: v.number(),
    title: v.string(),
    role: v.string(),
    description: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
    experience: v.number(),
    experienceIn: v.union(v.literal("years"), v.literal("months")),
    keywords: v.array(v.string()),
    assessment: v.union(v.literal("voice"), v.literal("mcq")),
    type: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Unauthorized: must be signed in.");
    }

    const user = await ctx.runQuery(api.users.getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new ConvexError("User not found.");
    }
    // TODO: Apply rate limiting

    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: `
      Generate ${args.numberOfQuestions} interview questions for the role of a "${args.role}".

    Details for context:
    - **Title**: ${args.title}
    - **Description**: ${args.description}
    - **Difficulty**: ${args.difficulty}  
    - **Experience Required**: ${args.experience} ${args.experienceIn} 
    - **Keywords/Technologies**: ${args.keywords.join(",")} (comma-separated) 
    - **Assessment Type**: ${args.assessment}
    - **Question Types**: ${args.type.join(",")} (comma-separated)  

    Format:
    - Give questions in json format as follows:
      [
        {
          question: open-ended or situational question suitable for spoken response,
        }
      ]
     

    Instructions:
    - The questions must match the role, difficulty level, and required experience.
    - Base the content around the listed keywords and technologies.
    - Use only the specified question types (e.g., coding, technical, behavioral).
    - Format each question appropriately based on the assessment type.
    - Don't add any additional text with questions or options except the given format.
    - The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
    
    Ensure all questions are unique, relevant, and challenge the candidate at a "${args.difficulty}" level.
    Avoid duplication and keep language clear and professional.
    `,
      system:
        "You are an expert technical interviewer. Your task is to generate interview questions based on the provided job details.",
    });

    return questions;
  },
});

const generateKeywords = action({
  args: {
    title: v.string(),
    role: v.string(),
    description: v.optional(v.string()),
    type: v.array(v.string()),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("Unauthorized: must be signed in.");
    }

    const user = await ctx.runQuery(api.users.getUserByClerkId, {
      clerkId: identity.subject,
    });

    if (!user) {
      throw new ConvexError("User not found.");
    }
    // TODO: Apply rate limiting

    const { object } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: z.object({
        keywords: z.array(z.string()),
      }),
      prompt: `
      Generate a concise list of the most relevant **technical keywords or technologies** required for an interview.
      
      Details:
      - **Title**: "${args.title}"
      - **Role**: "${args.role}"
      - **Description**: "${args.description || "N/A"}"
      - **Question Types**: ${args.type.join(", ")}
      - **Difficulty Level**: "${args.difficulty}"
      
      Instructions:
      - Focus only on technologies, tools, frameworks, libraries, protocols, concepts, or languages.
      - Only include relevant keywords used in interviews for this role and level.
      - Do NOT include any explanation, greetings, or extra text.
      `,

      system: `You are an expert AI trained to extract relevant technical keywords and technologies for interviews.

      Your job is to return only a list of technologies, tools, frameworks, protocols, and programming concepts based on the input provided.

      Do not include any explanation, formatting, or additional text`,
    });

    return object.keywords;
  },
});

export {
  generateDescription,
  generateKeywords,
  generateMCQBasedQuestions,
  generateVoiceBasedQuestions,
};
