"use client";

import { jobInterviewSteps } from "@/constants";
import { useCopy } from "@/hooks/useCopy";
import { useStep } from "@/hooks/useStep";
import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useRef, useState } from "react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { getLocalStorage, removeLocalStorage } from "@/utils/localstorage";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Clock, Copy, List, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ConvexError } from "convex/values";
import FormError from "@/components/error/FormError";
import { Assessment } from "@/types";
import { toast } from "sonner";

interface Props {
  assessment: Assessment;
}

export default function PreviewLink({ assessment }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<null | string>(null);
  const [interviewId, setInterviewId] = useState<Id<"interviews">>();
  const inputRef = useRef<HTMLInputElement | null>(null);

  // step-hook
  const { prevStep } = useStep(jobInterviewSteps);

  // copy-hook
  const { isCopied, copyToClipboard } = useCopy();

  // query & mutation
  const interview = useQuery(
    api.interviews.getInterviewById,
    interviewId ? { interviewId } : "skip"
  );
  const createNotification = useMutation(api.notifications.createNotification);

  // router
  const router = useRouter();

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    try {
      const notificationId = await createNotification({
        userId: interview?.createdById as Id<"users">,
        title: "Interview is ready",
        message: "You can start the interview process now",
        read: false,
        type: "interview",
      });

      if (notificationId) {
        toast.success("Interview is ready");
        removeLocalStorage(
          assessment === "voice" ? "voiceInterviewId" : "mcqInterviewId"
        );
        router.push("/dashboard/recruiter/interviews");
      }
    } catch (error) {
      console.log("Error while creating notification-interview", error);
      const convexError = error as ConvexError<string>;
      setError(convexError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interviewId = getLocalStorage(
      assessment === "voice" ? "voiceInterviewId" : "mcqInterviewId"
    );
    if (interviewId) setInterviewId(interviewId as Id<"interviews">);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">MCQ Interview is Ready!</CardTitle>
        <CardDescription>
          Share this link with your candidates to start the interview process
        </CardDescription>
      </CardHeader>

      <CardContent>
        <section className="group shadow border dark:border-muted dark:bg-muted/30 rounded-lg p-3 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-bold">Interview Link</h2>
            <p className="p-1 px-2 rounded-full bg-primary/20 text-primary group-hover:bg-primary/30 transition-all duration-300 text-sm">
              Valid for 24 hours
            </p>
          </div>

          {/* Copy Link */}
          <div className="w-full flex items-center border rounded-full p-1">
            <Input
              type="text"
              className="w-full bg-transparent outline-none border-none flex-1"
              disabled
              defaultValue={
                interview?._id
                  ? `${process.env.NEXT_PUBLIC_APP_BASE_URL}/interview/${interview._id}`
                  : ""
              }
              ref={inputRef}
            />
            <Button
              className={`w-auto sm:min-w-[100px] rounded-full min-h-10 ${
                isCopied ? "bg-emerald-500 hover:bg-emerald-600" : "bg-primary"
              } text-white`}
              onClick={
                isCopied
                  ? undefined
                  : () => copyToClipboard(inputRef?.current?.value || "")
              }
            >
              {isCopied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
              <span className="hidden sm:inline">
                {isCopied ? "Link Copied" : "Copy Link"}
              </span>
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4" />
              <span>
                {(interview?.duration && interview?.duration / 60) || 0} Minutes
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <List className="size-4" />
              <span>{interview?.questions.length} Questions</span>
            </div>
          </div>
        </section>

        {error && <FormError message={error} />}
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <Button onClick={prevStep} className="text-white min-h-10 min-w-22">
          <ArrowLeft className="size-5" />
          <span>Back</span>
        </Button>

        <Button className="text-white min-h-10 min-w-22" onClick={handleFinish}>
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <span>Finish</span>
              <Check className="size-5" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
