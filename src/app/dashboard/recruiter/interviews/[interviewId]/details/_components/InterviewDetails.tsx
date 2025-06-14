"use client";

import React, { useEffect, useState } from "react";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthContext } from "@/context/AuthStore";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";
import { notFound } from "next/navigation";
import { Details } from "./tabs/Details";
import { Candidates } from "./tabs/Candidates";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { PLAN_LIMITS } from "@/utils/subscriptions";

interface Props {
  interviewId: Id<"interviews">;
}

export function InterviewDetails({ interviewId }: Props) {
  const [maxCandidates, setMaxCandidates] = useState<number>(0);
  const [existingCandidatesIds, setExistingCandidatesIds] = useState<
    { userId: Id<"users">; status: string }[]
  >([]);
  const { user } = useAuthContext();

  const interview = useQuery(api.interviews.getInterviewById, { interviewId });
  const participants = useQuery(
    api.participants.getInterviewParticipants,
    interviewId ? { interviewId } : "skip"
  );
  const subscription = useQuery(api.subscriptions.getUserSubscription);

  useEffect(() => {
    if (subscription) {
      const candidatesLimit =
        PLAN_LIMITS[subscription.plan].candidatesPerInterview;
      setMaxCandidates(candidatesLimit);
    }
  }, [subscription]);

  useEffect(() => {
    if (participants) {
      setExistingCandidatesIds(
        participants.map(({ participant: candidate }) => ({
          userId: candidate.userId,
          status: candidate.status,
        }))
      );
    }
  }, [participants]);

  if (
    interview === undefined ||
    participants === undefined ||
    subscription === undefined
  )
    return <div>loading...</div>;

  if (interview === null) return notFound();

  return (
    <section className="space-y-6">
      <Button size={"icon"} className="text-white" asChild>
        <Link href="/dashboard/recruiter/interviews">
          <ChevronLeft className="size-5" />
        </Link>
      </Button>
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{interview.title}</h1>

          <p className="text-muted-foreground">at {user?.companyName}</p>
        </div>
        <Badge variant={"outline"} className="rounded-full uppercase">
          {interview.assessment}
        </Badge>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="w-full mb-2 bg-transparent">
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-transparent  data-[state=active]:border-b-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none pb-2 text-muted-foreground"
          >
            Details
          </TabsTrigger>
          <TabsTrigger
            value="candidates"
            className="data-[state=active]:bg-transparent  data-[state=active]:border-b-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none pb-2 text-muted-foreground"
          >
            Candidates ({participants.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <Details
            interview={interview}
            canAddCandidates={participants.length < maxCandidates}
            existingCandidatesIds={existingCandidatesIds}
          />
        </TabsContent>
        <TabsContent value="candidates">
          <Candidates
            participants={participants}
            interviewId={interviewId}
            existingCandidatesIds={existingCandidatesIds}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}
