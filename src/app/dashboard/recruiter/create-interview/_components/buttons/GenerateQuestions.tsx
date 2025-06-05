"use client";

import React, { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";
import { api } from "../../../../../../../convex/_generated/api";
import { useAction } from "convex/react";
import { ConvexError } from "convex/values";
import { Question } from "../steps/AddQuestions";
import { Assessment, Interview } from "@/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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
  const [questionsLimitError, setQuestionsLimitError] = useState<string | null>(
    null
  );
  const [numberOfQuestionsToGenerate, setNumberOfQuestionsToGenerate] =
    useState<string>("");
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
        numberOfQuestions: parseInt(numberOfQuestionsToGenerate),
        keywords: interview.keywords,
        type: interview.type,
      };

      console.log("request data", data);

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

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);

    // check if value is greater than number of questions
    if (value > numberOfQuestions) {
      setQuestionsLimitError(
        `Please enter a number less than or equal to ${numberOfQuestions}`
      );
      setNumberOfQuestionsToGenerate("");
      return;
    }

    setQuestionsLimitError(null);
    setNumberOfQuestionsToGenerate(e.target.value);
  };

  const handleOnOpenChange = () => {
    setQuestionsLimitError(null);
    setNumberOfQuestionsToGenerate("");
  };

  return (
    <>
      <Popover onOpenChange={handleOnOpenChange}>
        <PopoverTrigger asChild>
          <Button
            className="min-h-10 from-blue-600 to-purple-600 bg-gradient-to-r"
            disabled={loading || isLimitReached}
          >
            {loading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Brain className="size-5" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium leading-none">AI Questions</h3>
              <p className="text-sm text-muted-foreground">
                Add number of questions you want to generate using Mock Wise AI.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-end">
                <Badge variant="secondary" className="mb-2 py-1 rounded-full">
                  Max Questions: {numberOfQuestions}
                </Badge>
              </div>
              <Input
                type="number"
                placeholder="Number of questions"
                className="min-h-10 placeholder:text-sm"
                value={numberOfQuestionsToGenerate}
                onChange={handleOnChange}
                min={1}
                max={numberOfQuestions}
                disabled={loading || isLimitReached}
              />
              {questionsLimitError && (
                <p className="text-destructive text-xs">
                  {questionsLimitError}
                </p>
              )}
              <Button
                className="w-full text-white min-h-10"
                disabled={
                  loading || isLimitReached || !numberOfQuestionsToGenerate
                }
                onClick={handleClick}
              >
                {loading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  "Generate Questions"
                )}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
