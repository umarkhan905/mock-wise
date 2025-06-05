import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import GenerateQuestions from "../buttons/GenerateQuestions";
import { useStep } from "@/hooks/useStep";
import { jobInterviewSteps } from "@/constants";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, Plus } from "lucide-react";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { getLocalStorage } from "@/utils/localstorage";
import { ConvexError } from "convex/values";
import FormError from "@/components/error/FormError";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Assessment } from "@/types";
import { Badge } from "@/components/ui/badge";
import { PLAN_LIMITS } from "@/utils/subscriptions";

interface Props {
  assessment: Assessment;
}

export interface Question {
  id: number;
  question: string;
  type: Assessment;
  options?: string[];
  timeLimit: number;
  answer: string;
  explanation?: string;
  isAiBased?: boolean;
}

const getAIBasedQuestionsLimit = (
  questions: Question[],
  maxQuestions: number,
  aiBasedQuestions: number
) => {
  const existingAIQuestions = questions.filter((q) => q.isAiBased).length;
  const remainingSlots = maxQuestions - questions.length;
  const remainingAI = aiBasedQuestions - existingAIQuestions;

  const aiQuestionsToGenerate = Math.min(remainingSlots, remainingAI);

  return aiQuestionsToGenerate;
};

export default function AddQuestions({ assessment }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [interviewId, setInterviewId] = useState<Id<"interviews">>();
  const [maxQuestions, setMaxQuestions] = useState<number>(0);
  const [aiBasedQuestions, setAiBasedQuestions] = useState<number>(0);

  // step-hook
  const { nextStep, prevStep } = useStep(jobInterviewSteps);

  // mutations and queries
  const updateInterviewQuestions = useMutation(api.interviews.updateQuestions);
  const interview = useQuery(
    api.interviews.getInterviewById,
    interviewId ? { interviewId } : "skip"
  );
  const subscription = useQuery(api.subscriptions.getUserSubscription);

  // ai based questions limit
  const aiBasedQuestionsLimit = getAIBasedQuestionsLimit(
    questions,
    maxQuestions,
    aiBasedQuestions
  );

  // actions
  const addQuestion = () => {
    if (questions.length >= maxQuestions) return;

    const newQuestion = {
      id: questions.length + 1,
      question: "",
      type: assessment,
      options: assessment === "mcq" ? ["", "", "", ""] : undefined,
      timeLimit: 60,
      answer: "",
    };

    setQuestions((prev) => [...prev, newQuestion]);
  };

  const removeQuestion = (id: number) => {
    setQuestions((prev) =>
      prev.filter((q) => q.id !== id).map((q, i) => ({ ...q, id: i + 1 }))
    );
  };

  const updateQuestion = (id: number, field: string, value: string) => {
    setQuestions(
      questions.map((question) =>
        question.id === id ? { ...question, [field]: value } : question
      )
    );
  };

  const updateOption = (id: number, optionIndex: number, value: string) => {
    const question = questions.find((q) => q.id === id);

    // if question or options not found, return
    if (!question || !question.options?.length) return;

    const updatedOptions = question.options.map((option, i) =>
      i === optionIndex ? value : option
    );

    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, options: updatedOptions } : q))
    );
  };

  // server action
  const saveQuestions = async () => {
    if (!questions.length) return setError("Please add at least one question");

    setLoading(true);
    setError(null);
    try {
      const duration = questions.reduce((acc, q) => acc + q.timeLimit, 0);
      const numberOfQuestions = questions.length;

      await updateInterviewQuestions({
        questions: questions.map((q) => ({
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation,
        })),
        interviewId: interviewId!,
        duration,
        numberOfQuestions,
      });
      setQuestions([]);
      nextStep();
    } catch (error) {
      console.log("Error while creating interview-questions", error);
      const convexError = error as ConvexError<string>;
      setError(convexError.message);
    } finally {
      setLoading(false);
    }
  };

  const isLimitReached = questions.length >= maxQuestions;
  const isAIBasedLimitReached =
    questions.filter((q) => q.isAiBased).length >= aiBasedQuestions;
  const isButtonDisabled =
    questions.length === 0 ||
    (assessment === "mcq" &&
      questions.some(
        (q) =>
          !q.question?.trim() ||
          !q.answer?.trim() ||
          (assessment === "mcq" && !q.options?.some((opt) => opt?.trim()))
      )) ||
    (assessment === "voice" && questions.some((q) => !q.question?.trim()));

  useEffect(() => {
    const interviewId = getLocalStorage(
      assessment === "voice" ? "voiceInterviewId" : "mcqInterviewId"
    );
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
              type: assessment,
              options: q.options,
              timeLimit: 60,
              answer: q.answer,
            }) as Question
        )
      );
    }
  }, [interview, assessment]);

  // plan usage
  useEffect(() => {
    if (subscription) {
      const plan = PLAN_LIMITS[subscription.plan] || PLAN_LIMITS.free;
      setMaxQuestions(plan.questionsPerInterview || 0);
      setAiBasedQuestions(plan.aiBasedQuestions || 0);
    }
  }, [subscription]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Interview Questions</CardTitle>
            <CardDescription>
              Add questions for your MCQ interview
            </CardDescription>
          </div>

          <GenerateQuestions
            numberOfQuestions={aiBasedQuestionsLimit}
            interview={interview}
            isLimitReached={isLimitReached || isAIBasedLimitReached}
            assessment={assessment}
            setError={setError}
            setQuestions={setQuestions}
          />
        </div>

        <Badge className="mt-4 text-white px-4 py-1 rounded-full">
          {questions.length} / {maxQuestions}
        </Badge>
      </CardHeader>

      <CardContent>
        {questions.length > 0 &&
          questions.map((question, index) => (
            <div
              key={question.id}
              className="mb-8 pb-8 border-b border-white/10 last:border-0 last:mb-0 last:pb-0"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Question {index + 1}</h3>

                  {/* AI Generated Question */}
                  {question.isAiBased && (
                    <Badge
                      variant={"outline"}
                      className="rounded-full text-primary bg-primary/10"
                    >
                      AI Generated
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  onClick={() => removeQuestion(question.id)}
                >
                  Remove
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`question-${question.id}`}>
                    Question Text
                  </Label>
                  <Textarea
                    id={`question-${question.id}`}
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(question.id, "question", e.target.value)
                    }
                    placeholder="Enter your question here..."
                    className="bg-muted resize-none"
                  />
                </div>

                {assessment === "mcq" && (
                  <div className="space-y-3">
                    <Label>Answer Options</Label>
                    {question?.options?.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <div className="flex-shrink-0 size-8 rounded-full bg-muted flex items-center justify-center text-xs">
                          {String.fromCharCode(65 + optIndex)}
                        </div>
                        <Input
                          value={option}
                          onChange={(e) =>
                            updateOption(question.id, optIndex, e.target.value)
                          }
                          placeholder={`Option ${optIndex + 1}`}
                          className="bg-muted min-h-10"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <section className="flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`time-${question.id}`}>
                      Time Limit (seconds)
                    </Label>
                    <Input
                      id={`time-${question.id}`}
                      type="number"
                      min="10"
                      max="300"
                      value={question.timeLimit || 60}
                      onChange={(e) =>
                        updateQuestion(question.id, "timeLimit", e.target.value)
                      }
                      className="bg-muted w-32 min-h-10"
                    />
                  </div>

                  {assessment === "mcq" && (
                    <div className="space-y-2">
                      <Label htmlFor={`correct-${question.id}`}>
                        Correct Answer
                      </Label>
                      <Input
                        id={`correct-${question.id}`}
                        value={question.answer}
                        placeholder="Option 1"
                        onChange={(e) =>
                          updateQuestion(question.id, "answer", e.target.value)
                        }
                        className="bg-muted w-32 min-h-10"
                      />
                    </div>
                  )}
                </section>
              </div>
            </div>
          ))}

        <Button
          variant="outline"
          className="w-full mt-4 border-dashed hover:bg-background/10 hover:text-white min-h-10"
          onClick={addQuestion}
          disabled={isLimitReached}
        >
          <Plus className="size-5" />
          Add Question
        </Button>

        {error && <FormError message={error} />}
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <Button onClick={prevStep} className="text-white min-h-10 min-w-22">
          <ArrowLeft className="size-5" />
          <span>Back</span>
        </Button>

        <Button
          className="text-white min-h-10 min-w-22"
          onClick={saveQuestions}
          disabled={loading || isButtonDisabled}
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
