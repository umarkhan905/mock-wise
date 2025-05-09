import {
  Bot,
  BriefcaseBusiness,
  LayoutDashboard,
  List,
  MessageSquare,
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
    title: "Mock Interviews",
    url: "/dashboard/mock-interviews",
    icon: List,
  },
  {
    title: "Job Interviews",
    url: "/dashboard/candidate/job-interviews",
    icon: BriefcaseBusiness,
  },
  {
    title: "Interviews",
    url: "/dashboard/candidate/messages",
    icon: MessageSquare,
  },
  {
    title: "Mock Wise AI",
    url: "/dashboard/candidate/chatbot",
    icon: Bot,
  },
];

export const dummyUser = {
  name: "John Doe",
  email: "jPv6S@example.com",
  avatar: "https://via.placeholder.com/150",
};
