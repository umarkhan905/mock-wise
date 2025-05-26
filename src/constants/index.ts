import {
  Bot,
  BriefcaseBusiness,
  Calendar,
  CalendarClock,
  ClipboardList,
  Code,
  FileText,
  Flame,
  Landmark,
  LayoutDashboard,
  Lightbulb,
  List,
  Meh,
  MessageCircle,
  MessageSquare,
  Plus,
  Smile,
  Users,
} from "lucide-react";

export const featuresData = [
  {
    title: "AI Voice Interviews",
    description:
      "Practice with our AI that simulates real interview scenarios and provides real-time feedback on your answers.",
    icon: "ai-voice-interviews-icon",
  },
  {
    title: "Customizable MCQ Tests",
    description:
      "Build your own multiple-choice question sets to test candidates on specific skills and knowledge areas.",
    icon: "customizable-mcq-tests-icon",
  },
  {
    title: "Interview Sharing",
    description:
      "Send interview invitations to candidates with a simple shareable link and track their progress.",
    icon: "interview-sharing-icon",
  },
  {
    title: "Real-time Messaging",
    description:
      "Chat with candidates or recruiters directly within the platform to coordinate interviews and provide feedback.",
    icon: "real-time-messaging-icon",
  },
  {
    title: "Detailed Analytics",
    description:
      "Get comprehensive reports on candidate performance with insights on skills, knowledge gaps, and improvement areas.",
    icon: "detailed-analytics-icon",
  },
  {
    title: "Mock Interview Library",
    description:
      "Access our extensive library of pre-built mock interviews for different industries and positions.",
    icon: "mock-interview-library-icon",
  },
];

export const candidateSidebarNavigation = [
  { title: "Dashboard", url: "/dashboard/candidate", icon: LayoutDashboard },
  {
    title: "Create Interview",
    url: "/dashboard/candidate/create-interview",
    icon: Plus,
  },
  {
    title: "Mock Interviews",
    url: "/dashboard/candidate/mock-interviews",
    icon: List,
  },

  {
    title: "Job Interviews",
    url: "/dashboard/candidate/job-interviews",
    icon: BriefcaseBusiness,
  },
  {
    title: "Chat",
    url: "/dashboard/candidate/chats",
    icon: MessageCircle,
  },
  {
    title: "Mock Wise AI",
    url: "/dashboard/candidate/chatbot",
    icon: Bot,
  },
];

export const recruiterSidebarNavigation = [
  { title: "Dashboard", url: "/dashboard/recruiter", icon: LayoutDashboard },
  {
    title: "Create Interview",
    url: "/dashboard/recruiter/create-interview",
    icon: Plus,
  },
  {
    title: "All Interviews",
    url: "/dashboard/recruiter/interviews",
    icon: List,
  },
  {
    title: "Chat",
    url: "/dashboard/recruiter/chats",
    icon: MessageCircle,
  },
  {
    title: "Calendar",
    url: "/dashboard/recruiter/calendar",
    icon: Calendar,
  },
  {
    title: "Mock Wise AI",
    url: "/dashboard/recruiter/chatbot",
    icon: Bot,
  },
];

export const dummyUser = {
  name: "John Doe",
  email: "jPv6S@example.com",
  avatar: "https://via.placeholder.com/150",
};

export const interviewTypes = [
  {
    name: "Technical",
    state: "technical",
    icon: Code,
  },
  {
    name: "Behavioral",
    state: "behavioral",
    icon: MessageSquare,
  },
  {
    name: "HR",
    state: "hr",
    icon: Users,
  },
  {
    name: "Aptitude",
    state: "aptitude",
    icon: Lightbulb,
  },
  {
    name: "Coding",
    state: "coding",
    icon: ClipboardList,
  },
  {
    name: "System Design",
    state: "system_design",
    icon: Landmark,
  },
  {
    name: "Case Study",
    state: "case_study",
    icon: FileText,
  },
];

export const difficultyLevels = [
  {
    name: "Easy",
    state: "easy",
    icon: Smile,
  },
  {
    name: "Medium",
    state: "medium",
    icon: Meh,
  },
  {
    name: "Hard",
    state: "hard",
    icon: Flame,
  },
];

export const experienceIn = [
  {
    name: "Years",
    state: "years",
    icon: CalendarClock,
  },
  {
    name: "Months",
    state: "months",
    icon: Calendar,
  },
];

export const jobInterviewSteps = [
  "add-details",
  "add-question",
  "schedule-interview",
  "preview",
] as const;

export const mockInterviewSteps = [
  "add-details",
  "add-question",
  "preview",
] as const;

export const jobInterviewTabs = [
  {
    name: "Interview Details",
    state: "add-details",
  },
  {
    name: "Add Questions",
    state: "add-question",
  },
  {
    name: "Schedule Interview",
    state: "schedule-interview",
  },
  {
    name: "Preview Interview",
    state: "preview",
  },
];

export const mockInterviewTabs = [
  {
    name: "Interview Details",
    state: "add-details",
  },
  {
    name: "Add Questions",
    state: "add-question",
  },
  {
    name: "Preview Interview",
    state: "preview",
  },
];

export const instructions = [
  {
    id: 1,
    content: "Answer the question as truthfully as possible.",
  },
  {
    id: 2,
    content: "Answer the question as concisely as possible.",
  },
  {
    id: 3,
    content: "Answer the question as quickly as possible.",
  },
];

export const defaultRecruiterFilters = {
  status: undefined,
  assessment: undefined,
  difficulty: undefined,
  experience: undefined,
  oderBy: "desc" as const,
};

export const defaultCandidateFilters = {
  status: undefined,
  difficulty: undefined,
  experience: undefined,
  oderBy: "desc" as const,
};
