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
import { useStep } from "@/hooks/useStep";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { api } from "../../../../../../../../convex/_generated/api";
import { getLocalStorage } from "@/utils/localstorage";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import { GenerateTopicQuestions } from "../buttons/GenerateQuestions";
import FormError from "@/components/error/FormError";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConvexError } from "convex/values";

interface IQuestion extends Question {
  id: number;
  timeLimit: number;
}

const QUESTIONS_LIMIT = 10;

export function AddTopicQuestions() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [interviewId, setInterviewId] = useState<Id<"interviews">>();

  //   step-hook
  const { prevStep, nextStep } = useStep(mockInterviewSteps);

  //   mutation & query
  const addQuestions = useMutation(api.interviews.updateQuestions);
  const interview = useQuery(
    api.interviews.getInterviewById,
    interviewId ? { interviewId } : "skip"
  );

  const handleAddQuestions = async () => {
    setLoading(true);
    setError(null);
    if (!interviewId) return;

    const duration = questions.reduce((acc, q) => acc + q.timeLimit, 0);
    const numberOfQuestions = questions.length;

    try {
      await addQuestions({
        interviewId,
        questions: questions.map((q) => ({
          question: q.question,
        })),
        numberOfQuestions,
        duration,
        validateTill: Date.now() + 7 * 24 * 60 * 60 * 1000,
      });
      nextStep();
    } catch (error) {
      console.log("Error while adding questions", error);
      const convexError = error as ConvexError<string>;
      setError(convexError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interviewId = getLocalStorage("interviewId");
    if (interviewId) setInterviewId(interviewId as Id<"interviews">);
  }, []);

  useEffect(() => {
    if (interview) {
      setQuestions(
        interview.questions.map(
          (q, index) =>
            ({
              id: index + 1,
              question: q.question,
              options: q.options,
              timeLimit: 60,
              answer: q.answer,
            }) as IQuestion
        )
      );
    }
  }, [interview]);

  const isLimitReached = questions.length >= QUESTIONS_LIMIT;
  const isButtonDisabled =
    questions.length === 0 || questions.some((q) => !q.question?.trim());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Interview Questions</CardTitle>
        <CardDescription>Add questions for your MCQ interview</CardDescription>
      </CardHeader>

      <CardContent>
        {questions.length === 0 && (
          <GenerateTopicQuestions
            interview={interview}
            isLimitReached={isLimitReached}
            setQuestions={setQuestions}
            setError={setError}
            numberOfQuestions={QUESTIONS_LIMIT - questions.length}
          />
        )}

        {questions.length > 0 && (
          <div className="flex flex-col gap-2">
            {questions.map((question) => (
              <div key={question.id} className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Question {question.id}</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`question-${question.id}`}>
                      Question Text
                    </Label>
                    <Textarea
                      id={`question-${question.id}`}
                      defaultValue={question.question}
                      disabled
                      placeholder="Enter your question here..."
                      className="bg-muted resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <FormError message={error} />}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button className="text-white min-h-10 min-w-22" onClick={prevStep}>
          <ArrowLeft className="size-5" />
          <span>Back</span>
        </Button>

        <Button
          className="text-white min-h-10 min-w-22"
          disabled={isButtonDisabled || loading}
          onClick={handleAddQuestions}
        >
          {loading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <span>Next</span>
              <ArrowRight className="size-5" />
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
