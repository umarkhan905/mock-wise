import { Id } from "../../convex/_generated/dataModel";

type ExperienceIn = "years" | "months";
type Difficulty = "easy" | "medium" | "hard";
type Assessment = "voice" | "mcq";
type Category = "mock" | "job";
type CreatedByRole = "candidate" | "recruiter";
type InterviewStatus = "pending" | "scheduled" | "created" | "expired";
type Filters = "all" | "unread" | "read";
type NotificationType = "all" | "interview" | "system" | "reminder";
type Plan = "free" | "basic" | "standard" | "pro";

interface AddDetails {
  title: string;
  description: string;
  role: string;
  type: string[];
  difficulty: string;
  keywords: string[];
  experience: string;
  experienceIn: string;
}

interface Question {
  question: string;
  options?: string[];
  answer?: string;
  explanation?: string;
}

interface InterviewType {
  _id: Id<"interviews">;
  duration?: number;
  description?: string;
  topic?: string;
  numberOfQuestions?: number;
  isScheduled?: boolean;
  validateTill?: number;
  type: string[];
  role: string;
  title: string;
  status: InterviewStatus;
  createdById: Id<"users">;
  createdByRole: CreatedByRole;
  difficulty: Difficulty;
  experience: number;
  experienceIn: ExperienceIn;
  keywords: string[];
  assessment: Assessment;
  category: Category;
  questions: Question[];
  _creationTime: number;
}

type Interview = InterviewType | undefined | null;

type SavedMessage = {
  role: "user" | "system" | "assistant";
  content: string;
};

interface Message {
  message: string;
  status: "read" | "sent" | "received";
  chatId: Id<"chats">;
  sendAt: number;
  senderId: Id<"users">;
}

interface RecruiterFilters {
  status: string | undefined;
  assessment: string | undefined;
  difficulty: string | undefined;
  experience: string | undefined;
  oderBy: "asc" | "desc";
}

interface CandidateFilters {
  status: string | undefined;
  difficulty: string | undefined;
  experience: string | undefined;
  oderBy: "asc" | "desc";
}

interface Notification {
  _id: Id<"notifications">;
  userId: Id<"users">;
  title: string;
  message: string;
  read: boolean;
  type: "interview" | "system" | "reminder";
  action?: {
    label: string;
    url: string;
  };
  _creationTime: number;
}

interface PlanUsage {
  _id: Id<"planUsage">;
  _creationTime: number;
  interviews: {
    total: number;
    used: number;
  };
  userId: Id<"users">;
  plan: "free" | "standard" | "pro";
  period: number;
  aiBasedQuestions: number;
  questionsPerInterview: number;
  attemptsPerInterview: number;
  candidatesPerInterview: number;
}

interface Subscription {
  _id: Id<"subscriptions">;
  stripeSubscriptionId?: string | undefined;
  cancelAtPeriodEnd?: boolean | undefined;
  nextPlan?: "free" | "standard" | "pro" | undefined;
  userId: Id<"users">;
  status: "expired" | "active" | "canceled";
  plan: "free" | "standard" | "pro";
  currentPeriodStart: number;
  currentPeriodEnd: number;
}

interface User {
  _id: Id<"users">;
  _creationTime: number;

  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  stripeCustomerId: string;
  image?: string;

  role: Roles;
  clerkId: string;

  // Recruiter only fields
  companyName?: string;

  // Chat fields
  isOnline?: boolean;
  lastSeen?: number;

  // Subscription fields
  subscriptionId?: Id<"subscriptions">;
  credits?: {
    total: number;
    remaining: number;
    used: number;
  };
}

export type Participant = {
  _id: Id<"participants">;
  interviewId: Id<"interviews">;
  userId: Id<"users">;
  status: "pending" | "in_progress" | "completed" | "scheduled";
  startedAt?: number;
  completedAt?: number;
  category: "mock" | "job";
  scheduledAt?: number;
  isScheduled?: boolean;
  jobId?: Id<"_scheduled_functions">;
};

export type Feedback = {
  _id: Id<"feedbacks">;
  userId: Id<"users">;
  interviewId: Id<"interviews">;
  participantId: Id<"participants">;
  totalRating: number;
  summary: string;
  strengths: string;
  weaknesses: string;
  improvements: string;
  assessment: string;
  recommendedForJob: boolean;
  recommendationReason?: string;
  rating: {
    name: string;
    score: number;
    comment: string;
  }[];
};
