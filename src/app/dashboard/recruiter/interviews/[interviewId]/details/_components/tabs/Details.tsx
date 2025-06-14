"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InterviewType } from "@/types";
import { Calendar, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { InviteCandidateModal } from "../modals/InviteCandidateModal";
import { Id } from "../../../../../../../../../convex/_generated/dataModel";

interface Props {
  interview: InterviewType;
  canAddCandidates: boolean;
  existingCandidatesIds: { userId: Id<"users">; status: string }[];
}

export function Details({
  interview,
  canAddCandidates,
  existingCandidatesIds,
}: Props) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Interview Information</CardTitle>
          <CardDescription>Details about this interview</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p>{new Date(interview._creationTime).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p>{Math.floor(interview.duration! / 60)} minutes</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="capitalize rounded-full py-1 px-4 bg-primary/20 text-primary">
              {interview.status === "created" ? "Active" : interview.status}
            </Badge>
          </div>

          <div className="space-y-1">
            <h2 className="text-foreground text-lg md:text-xl font-semibold">
              Description:
            </h2>
            <p className="text-sm md:text-base">{interview.description}</p>
          </div>

          <div className="space-y-1">
            <h2 className="text-foreground text-lg md:text-xl font-semibold">
              Interview Questions:
            </h2>
            <ScrollArea className="h-48 border rounded-md p-4">
              <ul className="list-disc pl-4 space-y-2">
                {interview?.questions?.map((q, i) => (
                  <li key={i} className="text-sm text-muted-foreground">
                    {q.question}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex w-full gap-4">
            <Button variant="outline" className="flex-1 min-h-10">
              <FileText className="size-5" />
              Export Results
            </Button>
            {interview.status !== "expired" && canAddCandidates && (
              <InviteCandidateModal
                interviewId={interview._id}
                existingCandidatesIds={existingCandidatesIds}
                triggerClassName="flex-1"
              />
            )}
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
