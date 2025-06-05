"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useStep } from "@/hooks/useStep";
import { jobInterviewSteps } from "@/constants";
import { api } from "../../../../../../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { getLocalStorage } from "@/utils/localstorage";
import { ConvexError } from "convex/values";
import FormError from "@/components/error/FormError";
import { Input } from "@/components/ui/input";
import { AddCandidatesModal } from "../modals/AddCandidatesModal";
import { UserCard } from "../modals/UserCard";
import { PLAN_LIMITS } from "@/utils/subscriptions";
import { Assessment } from "@/types";
import { Badge } from "@/components/ui/badge";
import { ScheduleLoader } from "../skeletons/ScheduleLoader";

interface Props {
  assessment: Assessment;
}

export default function Schedule({ assessment }: Props) {
  const [interviewId, setInterviewId] = useState<Id<"interviews">>();
  const [dateTime, setDateTime] = useState<string>("");
  const [loading, setLoading] = useState<"schedule" | "unSchedule" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [maxCandidates, setMaxCandidates] = useState<number>(0);

  const scheduleInterview = useMutation(api.interviews.scheduleInterview);
  const interview = useQuery(
    api.interviews.getInterviewById,
    interviewId ? { interviewId } : "skip"
  );
  const scheduledCandidates = useQuery(
    api.participants.getScheduledParticipants,
    interviewId ? { interviewId } : "skip"
  );
  const scheduleCandidate = useMutation(
    api.participants.updateCandidateScheduledAt
  );
  const subscription = useQuery(api.subscriptions.getUserSubscription);

  const { nextStep, prevStep } = useStep(jobInterviewSteps);

  const handleScheduleInterview = async () => {
    setLoading("schedule");
    setError(null);

    const now = new Date();
    const scheduledDate = new Date(dateTime);

    if (scheduledDate < now) {
      toast.error("Please select a future date.");
      setLoading(null);
      return;
    }

    try {
      await scheduleInterview({
        scheduledAt: scheduledDate.getTime(),
        isScheduled: true,
        interviewId: interviewId!,
        validateTill: scheduledDate.getTime() + 24 * 60 * 60 * 1000, // 24 hours later after scheduling
      });

      // schedule candidates if any
      if (scheduledCandidates && scheduledCandidates.length > 0) {
        await Promise.all(
          scheduledCandidates.map(async (candidate) => {
            await scheduleCandidate({
              participantId: candidate._id,
              scheduledAt: new Date(dateTime).getTime(),
              jobId: candidate.jobId!,
            });
          })
        );
      }
    } catch (error) {
      console.log("Error while scheduling interview", error);
      const convexError = error as ConvexError<string>;
      setError(convexError.message);
    } finally {
      setLoading(null);
    }
  };

  const handleRescheduleInterview = async () => {
    setLoading("schedule");
    setError(null);

    const scheduledDate = new Date(dateTime);

    try {
      await scheduleInterview({
        scheduledAt: scheduledDate.getTime(),
        isScheduled: true,
        interviewId: interviewId!,
        validateTill: scheduledDate.getTime() + 24 * 60 * 60 * 1000, // 24 hours later after scheduling
        jobId: interview?.jobId,
      });

      // reschedule candidates
      if (scheduledCandidates && scheduledCandidates.length > 0) {
        await Promise.all(
          scheduledCandidates.map(async (candidate) => {
            await scheduleCandidate({
              participantId: candidate._id,
              scheduledAt: new Date(dateTime).getTime(),
              jobId: candidate.jobId!,
            });
          })
        );
      }
    } catch (error) {
      console.log("Error while scheduling interview", error);
      const convexError = error as ConvexError<string>;
      setError(convexError.message);
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    const interviewId = getLocalStorage(
      assessment === "voice" ? "voiceInterviewId" : "mcqInterviewId"
    );
    if (interviewId) setInterviewId(interviewId as Id<"interviews">);
  }, []);

  useEffect(() => {
    if (interview && interview.scheduledAt) {
      const date = new Date(interview.scheduledAt);
      setDateTime(format(date, "yyyy-MM-dd'T'HH:mm"));
    }
  }, [interview]);

  useEffect(() => {
    if (subscription) {
      const candidatesLimit =
        PLAN_LIMITS[subscription.plan].candidatesPerInterview;
      setMaxCandidates(candidatesLimit);
    }
  }, [subscription]);

  if (scheduledCandidates === undefined) {
    // Handle loading state
    return <ScheduleLoader />;
  }

  const isNextDisabled =
    loading === "schedule" ||
    loading === "unSchedule" ||
    !dateTime ||
    !scheduledCandidates.length;

  return (
    <Card>
      <CardHeader>
        <section className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">Schedule Interview</CardTitle>
            <CardDescription>
              Select the date to schedule the interview
            </CardDescription>
          </div>
        </section>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="space-y-2 w-full">
            <Label htmlFor="time">Schedule Interview At</Label>
            <Input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="min-h-10 w-full"
            />
          </div>

          <div className="flex justify-end">
            {dateTime && (
              <Button
                className="min-h-10 text-white min-w-46"
                disabled={loading === "schedule"}
                onClick={
                  interview?.isScheduled
                    ? handleRescheduleInterview
                    : handleScheduleInterview
                }
              >
                {loading === "schedule" ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : interview?.isScheduled ? (
                  "Reschedule Interview"
                ) : (
                  "Schedule Interview"
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {interview && interview.isScheduled && (
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h2 className="font-medium">
                {scheduledCandidates.length > 0
                  ? "Scheduled Candidates"
                  : "Add Candidates to Interview"}
              </h2>

              <Badge className="py-1 px-4 rounded-full text-white">
                {scheduledCandidates.length} / {maxCandidates}
              </Badge>
            </div>
          )}

          {scheduledCandidates.length > 0 &&
            scheduledCandidates.map((c) => (
              <UserCard
                key={c._id}
                user={{
                  _id: c.candidate?._id as Id<"users">,
                  image: c.candidate?.image as string,
                  username: c.candidate?.username as string,
                  companyName: c.candidate?.companyName || "",
                  role: c.candidate?.role as "candidate",
                }}
                interviewId={interviewId!}
                buttonType="remove"
              />
            ))}
        </div>

        {interviewId &&
          scheduledCandidates.length < maxCandidates &&
          interview?.isScheduled && (
            <AddCandidatesModal
              interviewId={interviewId}
              scheduledAt={dateTime}
            />
          )}

        {error && <FormError message={error} />}
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <Button onClick={prevStep} className="text-white min-h-10 min-w-22">
          <ArrowLeft className="size-5" />
          <span>Back</span>
        </Button>

        <Button
          onClick={nextStep}
          disabled={isNextDisabled}
          className="text-white min-h-10 min-w-22"
        >
          <span>Next</span>
          <ArrowRight className="size-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
