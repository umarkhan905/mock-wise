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
import { format, setHours, setMinutes } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CalendarIcon, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

export default function Schedule() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>(""); // format: "HH:mm"
  const [interviewId, setInterviewId] = useState<Id<"interviews">>();

  const [loading, setLoading] = useState<"schedule" | "unSchedule" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const scheduleInterview = useMutation(api.interviews.scheduleInterview);
  const unScheduleInterview = useMutation(api.interviews.unScheduleInterview);
  const interview = useQuery(
    api.interviews.getInterviewById,
    interviewId ? { interviewId } : "skip"
  );

  const { nextStep, prevStep } = useStep(jobInterviewSteps);

  const handleScheduleInterview = async () => {
    if (!date || !time) return toast.error("Please select a date and time.");

    setLoading("schedule");
    setError(null);

    const now = new Date();
    let timestamp = 0;

    const [hour, minute] = time.split(":").map(Number);
    const fullDate = setMinutes(setHours(date, hour), minute);

    if (fullDate <= now) {
      alert("Please select a future date and time.");
      return;
    }

    timestamp = fullDate.getTime();

    try {
      await scheduleInterview({
        scheduledAt: timestamp,
        isScheduled: true,
        interviewId: interviewId!,
      });
    } catch (error) {
      console.log("Error while scheduling interview", error);
      const convexError = error as ConvexError<string>;
      setError(convexError.message);
    } finally {
      setLoading(null);
    }
  };

  const handleUnScheduleInterview = async () => {
    if (!interview?.jobId) return;

    setLoading("unSchedule");
    setError(null);
    try {
      await unScheduleInterview({
        interviewId: interviewId!,
        jobId: interview.jobId,
      });

      setDate(undefined);
    } catch (error) {
      console.log("Error while un-scheduling interview", error);
      const convexError = error as ConvexError<string>;
      setError(convexError.message);
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    const interviewId = getLocalStorage("interviewId");
    if (interviewId) setInterviewId(interviewId as Id<"interviews">);
  }, []);

  useEffect(() => {
    if (interview && interview.scheduledAt) {
      setDate(new Date(interview.scheduledAt));
      setTime(
        new Date(interview.scheduledAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    }
  }, [interview]);

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

          <div className="flex items-center space-x-2">
            <Switch id="schedule-for-candidates" />
            <Label htmlFor="schedule-for-candidates">
              Schedule For Candidates
            </Label>
          </div>
        </section>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="date">Pick a date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal hover:bg-primary/20 hover:text-white bg-muted min-h-10",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                fromDate={new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2 w-full">
          <Label htmlFor="time">
            Time
            <span className="text-xs text-muted-foreground"> (optional)</span>
          </Label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="min-h-10 w-full"
          />
        </div>

        <div className="flex justify-end gap-2">
          {date && interview?.isScheduled && (
            <Button
              variant={"destructive"}
              disabled={loading === "unSchedule"}
              onClick={handleUnScheduleInterview}
              className="min-h-10 min-w-46"
            >
              {loading === "unSchedule" ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                "Unschedule Interview"
              )}
            </Button>
          )}

          {date && (
            <Button
              className="min-h-10 text-white min-w-46"
              disabled={loading === "schedule"}
              onClick={handleScheduleInterview}
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

        {error && <FormError message={error} />}
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <Button onClick={prevStep} className="text-white min-h-10 min-w-22">
          <ArrowLeft className="size-5" />
          <span>Back</span>
        </Button>

        <Button onClick={nextStep} className="text-white min-h-10 min-w-22">
          <span>Next</span>
          <ArrowRight className="size-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
