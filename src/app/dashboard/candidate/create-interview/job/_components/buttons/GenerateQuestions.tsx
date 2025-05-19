"use client";

import { Button } from "@/components/ui/button";
import { useAction } from "convex/react";
import { Brain, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { api } from "../../../../../../../../convex/_generated/api";
import { ConvexError } from "convex/values";

interface QuestionWithId extends Question {
  id: number;
  timeLimit: number;
}

interface Props {
  isLimitReached: boolean;
  interview: Interview;
  numberOfQuestions: number;
  setQuestions: React.Dispatch<React.SetStateAction<QuestionWithId[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export function GenerateJobQuestions({
  isLimitReached,
  interview,
  numberOfQuestions,
  setQuestions,
  setError,
}: Props) {
  const [loading, setLoading] = useState<boolean>(false);

  const generateQuestions = useAction(api.ai.generateVoiceBasedQuestions);

  const handleGenerateQuestions = async () => {
    setLoading(true);
    setError(null);
    if (!interview) return;

    try {
      const generatedQuestions = await generateQuestions({
        difficulty: interview.difficulty,
        title: interview.title,
        type: interview.type,
        numberOfQuestions,
        assessment: "voice",
        description: interview.description!,
        experience: interview.experience,
        experienceIn: interview.experienceIn,
        keywords: interview.keywords,
        role: interview.role,
      });
      const questions = JSON.parse(
        generatedQuestions.replace("```json", "").replace("```", "")
      );

      setQuestions((prev) => [
        ...prev,
        ...questions.map(
          (q: { question: string; timeLimit: number }, i: number) => ({
            id: prev.length + i + 1,
            question: q.question,
            timeLimit: q.timeLimit,
          })
        ),
      ]);
    } catch (error) {
      console.log("Error while generating questions", error);
      const convexError = error as ConvexError<string>;
      setError(convexError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-52 flex items-center justify-center gap-2">
      <Button
        disabled={isLimitReached || loading}
        onClick={handleGenerateQuestions}
        className="min-h-10 from-blue-600 to-purple-600 bg-gradient-to-r min-w-48"
      >
        {loading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <>
            <Brain className="size-5" />
            <span>Generate Questions</span>
          </>
        )}
      </Button>
    </div>
  );
}
