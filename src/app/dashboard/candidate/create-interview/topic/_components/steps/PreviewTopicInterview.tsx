"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockInterviewSteps } from "@/constants";
import { useCopy } from "@/hooks/useCopy";
import { useStep } from "@/hooks/useStep";
import { useAction, useMutation, useQuery } from "convex/react";
import { ArrowLeft, ArrowRight, Check, Copy, Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { api } from "../../../../../../../../convex/_generated/api";
import { getLocalStorage, removeLocalStorage } from "@/utils/localstorage";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { ConvexError } from "convex/values";
import FormError from "@/components/error/FormError";
import { useRouter } from "next/navigation";

type Loading = "finish" | "join" | null;

export function PreviewTopicInterview() {
  // TODO: SEND INTERVIEW LINK TO CANDIDATE VIA EMAIL
  const [loading, setLoading] = useState<Loading>(null);
  const [error, setError] = useState<string | null>(null);
  const [interviewId, setInterviewId] = useState<Id<"interviews">>();
  const inputRef = useRef<HTMLInputElement | null>(null);

  //  step-hook
  const { prevStep } = useStep(mockInterviewSteps);

  // copy-hook
  const { isCopied, copyToClipboard } = useCopy();

  // query & mutation
  const interview = useQuery(
    api.interviews.getInterviewById,
    interviewId ? { interviewId } : "skip"
  );
  const createNotification = useMutation(api.notifications.createNotification);
  const generateFinish = useAction(api.ai.generateFinish);
  const updateFinish = useMutation(api.interviews.updateFinish);

  // router
  const router = useRouter();

  const handleFinish = async (loading: Loading) => {
    setLoading(loading);
    setError(null);

    if (!interview) return;

    try {
      const { description, keywords } = await generateFinish({
        difficulty: interview.difficulty,
        title: interview.title,
        type: interview.type,
        topic: interview.topic!,
      });

      if (!description || !keywords) return setLoading(null);

      await Promise.all([
        updateFinish({
          interviewId: interview._id,
          description,
          keywords,
        }),

        createNotification({
          userId: interview?.createdById as Id<"users">,
          title: "Interview is ready",
          message: "You can start the interview process now",
          read: false,
          type: "interview",
        }),
      ]);

      removeLocalStorage("interviewId");
      if (loading === "finish") {
        router.push("/dashboard/candidate/mock-interviews");
      }
    } catch (error) {
      console.log("Error while creating notification-interview", error);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          Topic Based Interview is Ready!
        </CardTitle>
        <CardDescription>
          Please check your email for the link to join the interview or click
          the button below.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 max-w-md mx-auto bg-primary/10 p-4 rounded-md text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary mx-auto">
            <Check className=" size-8" />
          </div>

          <h2 className="text-lg font-bold">Interview Link</h2>
          <p className="text-sm text-muted-foreground">
            Save this link to start the interview process in the future
          </p>

          <div>
            <input
              hidden
              readOnly
              defaultValue={
                interview?._id
                  ? `${process.env.NEXT_PUBLIC_APP_BASE_URL}/interview/${interview._id}`
                  : ""
              }
              ref={inputRef}
            />
            <Button
              onClick={() => copyToClipboard(inputRef.current?.value || "")}
              className={`min-h-10 text-white min-w-52 ${isCopied ? "bg-emerald-500 hover:bg-emerald-600" : "bg-primary"}`}
            >
              {isCopied ? (
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
          </div>

          <Button
            asChild
            className="text-white min-h-10 min-w-52"
            onClick={() => handleFinish("join")}
            disabled={loading === "join"}
          >
            <Link
              href={`${process.env.NEXT_PUBLIC_APP_BASE_URL}/interview/${interview?._id}`}
            >
              {loading === "join" ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  <span>Join Interview</span>
                  <ArrowRight className="size-5" />
                </>
              )}
            </Link>
          </Button>
        </div>

        {error && <FormError message={error} />}
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <Button className="text-white min-h-10 min-w-22" onClick={prevStep}>
          <ArrowLeft className="size-5" />
          <span>Back</span>
        </Button>

        <Button
          className="text-white min-h-10 min-w-22"
          onClick={() => handleFinish("finish")}
          disabled={loading === "finish"}
        >
          {loading === "finish" ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <span>Finish</span>
              <ArrowRight className="size-5" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
