import { ConvexError, v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { google } from "@ai-sdk/google";
import { generateObject, generateText } from "ai";
import { z } from "zod";

// schema
const ratingItemSchema = z.object({
  name: z.enum([
    "Communication Skills",
    "Technical Knowledge",
    "Problem-Solving",
    "Cultural & Role Fit",
    "Confidence & Clarity",
    "Experience",
    "Presentation Skills",
  ]),
  score: z.number(),
  comment: z.string(),
});

const interviewEvaluationSchema = z.object({
  totalRating: z.number(),
  rating: z.array(ratingItemSchema).length(7),
  summary: z.string(),
  strengths: z.string(),
  weaknesses: z.string(),
  improvements: z.string(),
  assessment: z.string(),
  recommendedForJob: z.boolean(),
  recommendationReason: z.string(),
});

const mcqRatingItemSchema = z.object({
  name: z.enum(["Technical Knowledge", "Problem-Solving", "Time Management"]),
  score: z.number(),
  comment: z.string(),
});

const mcqInterviewEvaluationSchema = z.object({
  totalRating: z.number(),
  rating: z.array(mcqRatingItemSchema).length(3),
  summary: z.string(),
  strengths: z.string(),
  weaknesses: z.string(),
  improvements: z.string(),
  assessment: z.string(),
  recommendedForJob: z.boolean(),
  recommendationReason: z.string(),
});

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

const generateFeedback = action({
  args: {
    transcript: v.array(
      v.object({
        role: v.string(),
        content: v.string(),
      })
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

    const formatTranscript = args.transcript
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n");

    const { object: feedback } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: interviewEvaluationSchema,
      prompt: `You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be objective, thorough, and critical in your analysis. Do not be lenient—highlight all mistakes, gaps, and areas for improvement clearly.

      Transcript:
      ${formatTranscript}

      Score the candidate from 0 to 10 in the following areas. Do not add any categories other than the ones listed:

      - **Communication Skills**: Clarity, articulation, structure of responses.
      - **Technical Knowledge**: Understanding of role-relevant technical concepts.
      - **Problem-Solving**: Analytical thinking and approach to solving problems.
      - **Cultural & Role Fit**: Alignment with the company’s values and job expectations.
      - **Confidence & Clarity**: Confidence, tone, and clarity during the conversation.
      - **Experience**: Relevance and depth of prior experience.
      - **Presentation Skills**: Effectiveness in presenting ideas or work clearly.

      Also include:
      - **Total Rating**: Overall impression of the candidate (average of all scores).
      - A brief **summary** of the interview in 3–4 sentences.
      - The candidate’s **strengths** and **weaknesses**.
      - Suggested **improvements** to help the candidate grow.
      - Final **assessment** on whether the candidate is a fit for the role.
      - Based on the **totalRating**, set "recommendedForJob": true if the score is **greater than or equal to 7.0**, otherwise set it to false.
      - If "recommendedForJob" is true, also include a "recommendationReason" explaining why the candidate is suitable for the role (1–2 sentences) else set "recommendationReason" to "N/A".
`,
    });

    return feedback;
  },
});

const generateMCQFeedback = action({
  args: {
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    wrongAnswers: v.number(),
    accuracy: v.number(),
    timeTaken: v.number(),
    questions: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        answer: v.string(),
        userAnswer: v.string(),
      })
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

    const { object: feedback } = await generateObject({
      model: google("gemini-2.0-flash"),
      schema: mcqInterviewEvaluationSchema,
      prompt: `You are an expert interview evaluator reviewing a multiple-choice based technical interview. Based on the provided user answers, correct answers, and any available timing data, generate a detailed feedback report.

      Input:
        - **Total Questions**: ${args.totalQuestions}
        - **Correct Answers**: ${args.correctAnswers}
        - **Wrong Answers**: ${args.wrongAnswers}
        - **Accuracy**: ${args.accuracy}
        - **Time Taken**: ${args.timeTaken} (in seconds)
        - **Questions**: ${JSON.stringify(args.questions)}

      Score the candidate from 0 to 10 in the following areas. Do not add any categories other than the ones listed:

        - **Technical Knowledge**: Accuracy and difficulty of answered questions.
        - **Problem-Solving**: Ability to choose the best solution among options.
        - **Time Management**: How efficiently time was used.
       
      Also include:
      - **Total Rating**: Overall impression of the candidate (average of all scores).
      - A brief **summary** of the interview in 3–4 sentences.
      - The candidate’s **strengths** and **weaknesses**.
      - Suggested **improvements** to help the candidate grow.
      - Final **assessment** on whether the candidate is a fit for the role.
      - Based on the **totalRating**, set "recommendedForJob": true if the score is **greater than or equal to 7.0**, otherwise set it to false.
      - If "recommendedForJob" is true, also include a "recommendationReason" explaining why the candidate is suitable for the role (1–2 sentences) else set "recommendationReason" to "N/A".  
      `,
      system:
        "You are an expert interview evaluator reviewing a multiple-choice based technical interview.",
    });

    return feedback;
  },
});

export {
  generateDescription,
  generateKeywords,
  generateMCQBasedQuestions,
  generateVoiceBasedQuestions,
  generateFeedback,
  generateMCQFeedback,
};
