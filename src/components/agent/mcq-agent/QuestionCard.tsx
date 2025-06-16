"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Question } from "@/types";
import { ArrowRight, AudioLines } from "lucide-react";
import React, { useEffect, useState } from "react";

interface QuestionWithId extends Question {
  id: string;
}

interface Props {
  currentQuestionIndex: number;
  totalQuestions: number;
  currentQuestion: QuestionWithId;
  userAnswers: Record<string, string>;
  isSpeaking: boolean;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  setUserAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onFinishInterview: () => void;
  handleSpeak: (text: string) => void;
}

export default function QuestionCard({
  totalQuestions,
  currentQuestionIndex,
  currentQuestion,
  isSpeaking,
  userAnswers,
  setUserAnswers,
  setCurrentQuestionIndex,
  onFinishInterview,
  handleSpeak,
}: Props) {
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [showNextButton, setShowNextButton] = useState<boolean>(true);

  const selectedAnswer = userAnswers[currentQuestion?.id as string];

  const onAnswer = (option: string) => {
    if (showExplanation) return;

    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion?.id as string]: option,
    }));
    setShowExplanation(true);
  };

  const getOptionClasses = (option: string) => {
    const isCorrect = option === currentQuestion?.answer;
    const isSelected = option === selectedAnswer;

    if (!showExplanation) return "border";

    if (isCorrect) return "bg-emerald-500/20 border-emerald-500";
    if (isSelected && !isCorrect) return "bg-red-500/20 border-red-500";

    return "border";
  };

  const onNext = () => {
    // check if last question
    if (currentQuestionIndex === totalQuestions - 1) return;

    setCurrentQuestionIndex((prev) => prev + 1);
    setShowExplanation(false);
  };

  useEffect(() => {
    if (currentQuestionIndex === totalQuestions - 1) {
      setShowNextButton(false);
    }
  }, [currentQuestionIndex, totalQuestions]);

  return (
    <Card className="w-full bg-card/90">
      <CardContent className="space-y-6">
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-xl font-medium text-interview-text">
            {currentQuestion?.question}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            className={`shrink-0 ${isSpeaking ? "animate-pulse" : ""}`}
            aria-label="Read question aloud"
            onClick={() => handleSpeak(currentQuestion.question)}
          >
            <AudioLines
              className={`size-5 ${isSpeaking ? "text-primary" : "text-muted-foreground"}`}
            />
          </Button>
        </div>

        <div className="space-y-3">
          {currentQuestion?.options?.map((option, index) => (
            <div
              key={index}
              className={`p-4 rounded-md cursor-pointer transition-colors ${getOptionClasses(option)}`}
              onClick={() => onAnswer(option)}
            >
              {option}
            </div>
          ))}
        </div>

        {showExplanation && currentQuestion?.explanation && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-md">
            <h4 className="font-medium text-primary">Explanation:</h4>
            <p className="text-muted-foreground">
              {currentQuestion?.explanation}
            </p>
          </div>
        )}

        <CardFooter className="flex justify-end px-0">
          {showExplanation && showNextButton && (
            <Button onClick={onNext} className="min-h-10">
              Next Question <ArrowRight className="size-4" />
            </Button>
          )}

          {showExplanation && !showNextButton && (
            <Button onClick={onFinishInterview} className="min-h-10">
              Finish Interview <ArrowRight className="size-4" />
            </Button>
          )}
        </CardFooter>
      </CardContent>
    </Card>
  );
}
