import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCopy } from "@/hooks/useCopy";
import { Interview } from "@/types";
import { Check, Copy } from "lucide-react";
import Link from "next/link";
import React from "react";

interface User {
  companyName: string | undefined;
}

interface Props {
  interview: Interview;
  user: User;
}

type Status = "pending" | "created" | "scheduled" | "expired";

const getInterviewStatus = (status: Status) => {
  switch (status) {
    case "pending":
      return "Pending";
    case "created":
      return "Active";
    case "scheduled":
      return "Scheduled";
    case "expired":
      return "Expired";
  }
};

const getStatusBasedClasses = (status: Status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-500/10 text-yellow-500";
    case "created":
      return "bg-primary/10 text-primary";
    case "scheduled":
      return "bg-blue-500/10 text-blue-500";
    case "expired":
      return "bg-destructive/10 text-destructive";
  }
};

export function InterviewCard({ interview, user }: Props) {
  const { isCopied, copyToClipboard } = useCopy();

  if (!interview) return null;

  return (
    <Card className="gap-2">
      <CardHeader className="px-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarImage src={"/logo.png"} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {user.companyName?.charAt(0) || "M"}
            </AvatarFallback>
          </Avatar>

          <div>
            <CardTitle className="line-clamp-1">{interview.title}</CardTitle>

            <div className="flex items-center gap-2 mt-1">
              <CardDescription className="line-clamp-1">
                {interview.role}
              </CardDescription>
              <Badge
                className={`${getStatusBasedClasses(interview.status)} rounded-full`}
                variant={"outline"}
              >
                {getInterviewStatus(interview.status)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-3">
        <p className="line-clamp-3 text-muted-foreground text-sm">
          {interview.description}
        </p>

        <Button className="min-h-10 w-full mt-2 text-white" asChild>
          <Link
            href={`/dashboard/candidate/interviews/${interview._id}/details`}
          >
            View Interview
          </Link>
        </Button>

        <Button
          className={`min-h-10 w-full mt-2 text-white ${interview.status !== "expired" && !isCopied && "hover:bg-primary/10 hover:text-white"} ${isCopied && "bg-green-500/10 text-green-500 hover:hover:bg-green-500/10 hover:text-green-500"}`}
          variant={interview.status === "expired" ? "destructive" : "outline"}
          disabled={interview.status === "expired"}
          onClick={() =>
            copyToClipboard(
              `${process.env.NEXT_PUBLIC_APP_BASE_URL}/interview/${interview._id}`
            )
          }
        >
          {interview.status === "expired" ? (
            "Expired"
          ) : isCopied ? (
            <>
              <Check className="size-5" />
              <span>Link Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-5" />
              <span>Copy Link</span>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
