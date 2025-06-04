import { Id } from "../_generated/dataModel";

type ExperienceIn = "years" | "months";
type Difficulty = "easy" | "medium" | "hard";
type Assessment = "voice" | "mcq";
type Category = "mock" | "job";
type CreatedByRole = "candidate" | "recruiter";
type InterviewStatus = "pending" | "scheduled" | "created" | "expired";
type NotificationType = "interview" | "system" | "reminder";

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
  scheduledAt?: number;
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

interface Notification {
  _id: Id<"notifications">;
  userId: Id<"users">;
  title: string;
  message: string;
  read: boolean;
  type: NotificationType;
  action?: {
    label: string;
    url: string;
  };
  _creationTime: number;
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

export {
  type Interview,
  type InterviewType,
  type Notification,
  type Subscription,
};
