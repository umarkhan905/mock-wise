"use client";

import React, { useEffect, useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { notFound, redirect, useRouter } from "next/navigation";
import { LoadingScreen } from "../loading/LoadingScreen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { v4 as uuid } from "uuid";
import QuestionCard from "./QuestionCard";
import { useAuth } from "@clerk/nextjs";
import { SpeechService } from "@/utils/speech";
import { Question } from "@/types";

enum InterviewStatus {
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  FINISHED = "FINISHED",
  GENERATING_FEEDBACK = "GENERATING_FEEDBACK",
  REDIRECTING = "REDIRECTING",
  ERROR = "ERROR",
}

interface Props {
  interviewId?: Id<"interviews">;
  participantId?: Id<"participants">;
}

interface QuestionWithId extends Question {
  id: string;
}

export default function MockWiseMcqAgent({
  interviewId,
  participantId,
}: Props) {
  const [status, setStatus] = useState<InterviewStatus>(
    InterviewStatus.CONNECTING
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [questions, setQuestions] = useState<QuestionWithId[]>([]);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const { userId: clerkUserId, isLoaded: isUserLoaded } = useAuth();

  const user = useQuery(
    api.users.getUserByClerkId,
    clerkUserId
      ? {
          clerkId: clerkUserId,
        }
      : "skip"
  );
  const interview = useQuery(
    api.interviews.getInterviewById,
    interviewId
      ? {
          interviewId,
        }
      : "skip"
  );
  const generateFeedback = useAction(api.ai.generateMCQFeedback);
  const createFeedback = useMutation(api.feedbacks.createFeedback);
  const updateParticipantStatus = useMutation(
    api.participants.updateParticipantStatus
  );

  const currentQuestion = questions[currentQuestionIndex];

  const getCorrectAnswersCount = (
    questions: QuestionWithId[],
    userAnswers: Record<string, string>
  ) => {
    let count = 0;

    questions.forEach((question) => {
      if (userAnswers[question.id] === question.answer) {
        count++;
      }
    });

    return count;
  };

  const handleSpeak = async (text: string) => {
    setIsSpeaking(true);
    await SpeechService.getInstance().speak(text);
    setIsSpeaking(false);
  };

  //   Start the interview
  const startInterview = async () => {
    setStatus(InterviewStatus.CONNECTED);
    setCurrentQuestionIndex(0);
    setUserAnswers({});

    // shuffle questions and set
    if (interview?.questions) {
      await updateParticipantStatus({
        participantId: participantId!,
        status: "in_progress",
      });

      // add id to each question
      const questionsWithIds = interview.questions.map((question) => ({
        ...question,
        id: uuid(),
      }));

      const shuffledQuestions = questionsWithIds.sort(
        () => Math.random() - 0.5
      );

      setQuestions(shuffledQuestions);
    }
  };

  const onFinishInterview = () => {
    setStatus(InterviewStatus.FINISHED);
  };

  const handleGenerateFeedback = async () => {
    setStatus(InterviewStatus.GENERATING_FEEDBACK);
    setError(null);
    const totalQuestions = questions.length;
    const correctAnswers = getCorrectAnswersCount(questions, userAnswers);
    const wrongAnswers = totalQuestions - correctAnswers;
    const accuracy = (correctAnswers / totalQuestions) * 100;

    const interviewQuestions = questions.map((question) => ({
      question: question.question,
      options: question.options || [],
      answer: question.answer || "",
      userAnswer: userAnswers[question.id],
    }));

    const feedback = await generateFeedback({
      correctAnswers,
      wrongAnswers,
      accuracy,
      timeTaken: 600,
      questions: interviewQuestions,
      totalQuestions,
    });

    if (feedback) {
      setStatus(InterviewStatus.REDIRECTING);
    }

    const feedbackId = await createFeedback({
      ...feedback,
      userId: user?._id as Id<"users">,
      interviewId: interviewId!,
      participantId: participantId!,
    });

    if (!feedbackId) {
      setStatus(InterviewStatus.ERROR);
      setError("Failed to create feedback");
      return;
    }

    if (feedbackId) {
      await updateParticipantStatus({
        participantId: participantId!,
        status: "completed",
        completedAt: Date.now(),
      });
      router.push(`/dashboard/candidate/interviews/${interviewId}/details`);
    }
  };

  useEffect(() => {
    if (interview) startInterview();
  }, [interview]);

  useEffect(() => {
    if (status === InterviewStatus.FINISHED) handleGenerateFeedback();
  }, [status]);

  useEffect(() => {
    handleSpeak(currentQuestion?.question || "");
  }, [currentQuestion]);

  if (user === null) redirect("/");

  if (interview === null || participantId === null) notFound();

  if (
    interview === undefined ||
    status === InterviewStatus.CONNECTING ||
    !isUserLoaded
  )
    return <LoadingScreen message="Connecting to Mock Wise MCQs Agent " />;

  if (status === InterviewStatus.GENERATING_FEEDBACK) {
    return <LoadingScreen message="Generating Feedback" />;
  }

  if (status === InterviewStatus.REDIRECTING) {
    return <LoadingScreen message="Redirecting" />;
  }

  if (status === InterviewStatus.ERROR) {
    return <div>An error occurred: {error}</div>;
  }

  return (
    <section className="flex flex-col min-h-screen text-foreground overflow-hidden pb-6 pt-10">
      <div className="container mx-auto px-4 h-full max-w-5xl">
        <div className="flex items-center justify-between mb-8 bg-card/90 p-2 border rounded-md">
          <div className="flex items-center gap-2">
            <Avatar className="size-10">
              <AvatarImage src={"/logo.png"} />
              <AvatarFallback className="rounded-full">CN</AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold">{interview.title}</h1>
          </div>
          {/* TODO: Add Timer */}
          <Badge
            variant={"outline"}
            className="min-w-[100px] py-1 rounded-full text-lg"
          >
            00:00
          </Badge>
        </div>

        {/* Mock Wise Agent */}
        <div className="max-w-lg mx-auto grid grid-cols-1 mb-8">
          {/* AI ASSISTANT CARD */}
          <Card className="bg-card/90 backdrop-blur-sm border border-border overflow-hidden relative">
            <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
              {/* AI VOICE ANIMATION */}
              <div
                className={`absolute inset-0 ${
                  isSpeaking ? "opacity-30" : "opacity-0"
                } transition-opacity duration-300`}
              >
                {/* Voice wave animation when speaking */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-center items-center h-20">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`mx-1 h-16 w-1 bg-primary rounded-full ${
                        isSpeaking ? "animate-sound-wave" : ""
                      }`}
                      style={{
                        animationDelay: `${i * 0.1}s`,
                        height: isSpeaking
                          ? `${Math.random() * 50 + 20}%`
                          : "5%",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* AI IMAGE */}
              <div className="relative size-32 mb-4">
                <div
                  className={`absolute inset-0 bg-primary opacity-10 rounded-full blur-lg ${
                    isSpeaking ? "animate-pulse" : ""
                  }`}
                />

                <div className="relative w-full h-full rounded-full bg-card flex items-center justify-center border border-border overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-secondary/10"></div>
                  <img
                    src="/logo.png"
                    alt="AI Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground">MockWise AI</h2>
              <p className="text-sm text-muted-foreground mt-1">
                AI Interviewer & Trainer
              </p>

              {/* SPEAKING INDICATOR */}

              <div
                className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border border-border ${
                  isSpeaking ? "border-primary" : ""
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSpeaking ? "bg-primary animate-pulse" : "bg-muted"
                  }`}
                />

                <span className="text-xs text-muted-foreground">
                  {isSpeaking ? "Speaking..." : "Waiting for your response..."}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Question Card  */}
        <QuestionCard
          currentQuestion={currentQuestion}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={interview.questions.length}
          userAnswers={userAnswers}
          isSpeaking={isSpeaking}
          setCurrentQuestionIndex={setCurrentQuestionIndex}
          setUserAnswers={setUserAnswers}
          onFinishInterview={onFinishInterview}
          handleSpeak={handleSpeak}
        />
      </div>
    </section>
  );
}
