type ExperienceIn = "years" | "months";
type Difficulty = "easy" | "medium" | "hard";
type Assessment = "voice" | "mcq";
type Category = "mock" | "job";
type CreatedByRole = "candidate" | "recruiter";
type InterviewStatus = "pending" | "scheduled" | "created" | "expired";

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
}

type Interview = InterviewType | undefined | null;
