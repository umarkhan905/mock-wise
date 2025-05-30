"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";
import { api } from "../../../../../../../convex/_generated/api";
import { useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { Question } from "../steps/AddQuestions";
import { Assessment, Interview } from "@/types";

interface Props {
  interview: Interview;
  numberOfQuestions: number;
  assessment: Assessment;
  isLimitReached: boolean;
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

interface AIQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export default function GenerateQuestions({
  numberOfQuestions,
  interview,
  assessment,
  isLimitReached,
  setError,
  setQuestions,
}: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const generateMCQQuestion = useAction(api.ai.generateMCQBasedQuestions);
  const generateVoiceQuestion = useAction(api.ai.generateVoiceBasedQuestions);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    // check if interview is null
    if (!interview) return;

    try {
      const data = {
        role: interview.role,
        title: interview.title,
        assessment: interview.assessment,
        description: interview.description!,
        experience: interview.experience,
        experienceIn: interview.experienceIn,
        difficulty: interview.difficulty,
        numberOfQuestions,
        keywords: interview.keywords,
        type: interview.type,
      };

      const generatedQuestions =
        assessment === "mcq"
          ? await generateMCQQuestion(data)
          : await generateVoiceQuestion(data);

      const questions = JSON.parse(
        generatedQuestions.replace("```json", "").replace("```", "")
      );

      setQuestions((prev) => [
        ...prev,
        ...questions.map((q: AIQuestion, i: number) => ({
          id: prev.length + i + 1,
          question: q.question,
          type: assessment,
          options: q.options,
          timeLimit: 60,
          answer: q.answer,
          explanation: q.explanation,
          isAiBased: true,
        })),
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
    <Button
      className="min-h-10 from-blue-600 to-purple-600 bg-gradient-to-r"
      disabled={loading || isLimitReached}
      onClick={handleClick}
    >
      {loading ? (
        <Loader2 className="size-5 animate-spin" />
      ) : (
        <Brain className="size-5" />
      )}
    </Button>
  );
}
