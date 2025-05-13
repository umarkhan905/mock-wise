"use client";

import { vapi } from "@/lib/vapi";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { INTERVIEWER } from "@/constants/vapi";
import { LoadingScreen } from "@/app/interview/_components/LoadingScreen";
import AgentScreen from "./AgentScreen";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  GENERATING_FEEDBACK = "GENERATING_FEEDBACK",
  REDIRECTING = "REDIRECTING",
  ERROR = "ERROR",
}

interface User {
  userId: Id<"users">;
  username: string;
  avatar: string;
}

interface Props {
  user: User;
  interviewId?: Id<"interviews">;
  participantId?: Id<"participants">;
  questions?: Question[];
  position: string;
  type: "generate" | "interview";
}

export default function MockWiseAgent({
  user,
  interviewId,
  participantId,
  questions,
  position,
  type,
}: Props) {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isFeedbackGenerated, setIsFeedbackGenerated] =
    useState<boolean>(false);

  const router = useRouter();

  //   actions and mutations
  const generateFeedback = useAction(api.ai.generateFeedback);
  const createFeedback = useMutation(api.feedbacks.createFeedback);
  const updateParticipantStatus = useMutation(
    api.participants.updateParticipantStatus
  );

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === "generate") {
      //   call to agent for create interview
    } else {
      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions.map((q) => `- ${q.question}`).join("\n");
      }

      await updateParticipantStatus({
        participantId: participantId!,
        status: "in_progress",
      });

      await vapi.start(INTERVIEWER, {
        variableValues: {
          questions: formattedQuestions,
          username: user.username,
          position,
        },
      });
    }
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const handleGenerateFeedback = async (messages: SavedMessage[]) => {
    setCallStatus(CallStatus.GENERATING_FEEDBACK);
    const feedback = await generateFeedback({ transcript: messages });
    const feedbackId = await createFeedback({
      ...feedback,
      userId: user.userId!,
      interviewId: interviewId!,
      participantId: participantId!,
    });

    if (!feedbackId) {
      setCallStatus(CallStatus.ERROR);
      setError("Failed to create feedback");
      return;
    }

    await updateParticipantStatus({
      participantId: participantId!,
      status: "completed",
      completedAt: Date.now(),
    });
    setCallStatus(CallStatus.REDIRECTING);
    router.push(`/interview/${interviewId}/feedback/${feedbackId}`);
  };

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      console.log("message-agent");
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.log("Error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    if (callStatus === CallStatus.FINISHED && type === "generate") {
      router.push("/dashboard/candidate/interviews");
    }
  }, [callStatus, messages, type, router]);

  useEffect(() => {
    if (
      callStatus === CallStatus.FINISHED &&
      type === "interview" &&
      !isFeedbackGenerated
    ) {
      // avoid for calling twice to generate feedback
      setIsFeedbackGenerated(true);

      handleGenerateFeedback(messages);
    }
  }, [callStatus, messages, type, isFeedbackGenerated]);

  useEffect(() => {
    if (type === "interview") handleCall();
  }, [type]);

  if (
    callStatus === CallStatus.INACTIVE ||
    callStatus === CallStatus.CONNECTING
  ) {
    return <LoadingScreen message="Connecting to Mock Wise Agent" />;
  }

  if (callStatus === CallStatus.GENERATING_FEEDBACK) {
    return <LoadingScreen message="Generating Feedback" />;
  }

  if (callStatus === CallStatus.REDIRECTING) {
    return <LoadingScreen message="Redirecting" />;
  }

  if (callStatus === CallStatus.ERROR) {
    return <div>An error occurred: {error}</div>;
  }

  return callStatus === CallStatus.ACTIVE ? (
    <AgentScreen
      messages={messages}
      lastMessage={lastMessage}
      isSpeaking={isSpeaking}
      handleDisconnect={handleDisconnect}
      user={user}
      type={type}
    />
  ) : null;
}
