import React from "react";
import { AlarmClock, Ban, CheckCircle, Info, UserX } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

type ResultType =
  | "expired"
  | "alreadyAttempted"
  | "notInterviewCandidate"
  | "attemptReached"
  | "scheduled";

const messageMap: Record<
  ResultType,
  { icon: React.ReactNode; title: string; description: string; color: string }
> = {
  expired: {
    icon: <AlarmClock className="text-yellow-500 size-10" />,
    title: "Interview Link Expired",
    description:
      "The interview link has expired. Please contact your interviewer for a new link.",
    color: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  alreadyAttempted: {
    icon: <CheckCircle className="text-green-500 size-10" />,
    title: "Interview Attempted",
    description: "You have already attempted this interview.",
    color: "bg-green-50 text-green-700 border-green-200",
  },
  notInterviewCandidate: {
    icon: <UserX className="text-red-500 size-10" />,
    title: "Not a Candidate",
    description: "You are not a candidate for this interview.",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  attemptReached: {
    icon: <Ban className="text-red-500 size-10" />,
    title: "Maximum Attempts Reached",
    description: "You have reached the maximum attempts. Upgrade to continue.",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  scheduled: {
    icon: <Info className="text-blue-500 size-10" />,
    title: "Interview Scheduled",
    description: `The interview is scheduled for`,
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
};

interface InterviewResultMessageProps {
  status: ResultType;
  scheduledDate?: string;
}

export const InterviewResultMessage: React.FC<InterviewResultMessageProps> = ({
  status,
  scheduledDate,
}) => {
  const { icon, title, color, description } = messageMap[status];

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div
            className={`${color} size-12 rounded-md flex items-center justify-center mx-auto`}
          >
            {icon}
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description}{" "}
            {scheduledDate && <span>{format(scheduledDate, "PPpp")}</span>}
          </CardDescription>
        </CardContent>

        <CardFooter>
          <Button asChild className="text-white min-h-10 w-full">
            <Link href="/dashboard/candidate">Back to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
