"use client";

import React, { useEffect } from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarImage } from "../ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { ChatBubble } from "./chat/ChatBubble";

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
  messages: SavedMessage[];
  isSpeaking: boolean;
  user: User;
  type: "generate" | "interview";
  title: string;
  callStatus: CallStatus;
  handleDisconnect?: () => void;
}

export default function AgentScreen({
  isSpeaking,
  messages,
  user,
  type = "generate",
  title,
  callStatus,
  handleDisconnect,
}: Props) {
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  // auto-scroll messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <section className="flex flex-col min-h-screen text-foreground overflow-hidden pb-6 pt-10">
      <div className="container mx-auto px-4 h-full max-w-5xl">
        {type === "interview" && (
          <div className="flex items-center justify-between mb-8 bg-card/90 p-2 border rounded-md">
            <div className="flex items-center gap-2">
              <Avatar className="size-10">
                <AvatarImage src={"/logo.png"} />
                <AvatarFallback className="rounded-full">CN</AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
            {/* TODO: Add Timer */}
            <Badge
              variant={"outline"}
              className="min-w-[100px] py-1 rounded-full text-lg"
            >
              00:00
            </Badge>
          </div>
        )}

        {/* Title */}
        {type === "generate" && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">
              <span>Generate Your </span>
              <span className="text-primary uppercase">Mock Interview</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Have a voice conversation with our AI assistant to create your
              perfect interview.
            </p>
          </div>
        )}

        {/* VIDEO CALL AREA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

          <Card
            className={`bg-card/90 backdrop-blur-sm border overflow-hidden relative`}
          >
            <div className="aspect-video flex flex-col items-center justify-center p-6 relative">
              {/* User Image */}
              <div className="relative size-32 mb-4">
                <img
                  src={user?.avatar}
                  alt="User"
                  // ADD THIS "size-full" class to make it rounded on all images
                  className="size-full object-cover rounded-full"
                />
              </div>

              <h2 className="text-xl font-bold text-foreground">You</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {user ? user.username : "Guest"}
              </p>

              {/* User Ready Text */}
              <div
                className={`mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-card border`}
              >
                <div className={`w-2 h-2 rounded-full bg-muted`} />
                <span className="text-xs text-muted-foreground">Ready</span>
              </div>
            </div>
          </Card>
        </div>

        {/* CHAT MESSAGES  */}
        {messages.length > 0 && (
          <div
            className="w-full bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 mb-8 h-64 transition-all duration-300 scroll-smooth overflow-y-auto scrollbar-hide"
            ref={chatContainerRef}
          >
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <ChatBubble
                  key={index}
                  message={msg.content}
                  isSender={msg.role === "user"}
                  avatarUrl={msg.role === "user" ? user?.avatar : "/logo.png"}
                  senderInitials={
                    msg.role === "user" ? user?.username.charAt(0) : "AI"
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* DISCONNECT BUTTON */}
        {type === "interview" && callStatus === CallStatus.ACTIVE && (
          <div className="flex items-center justify-center gap-4">
            <Button
              className="w-40 min-h-10"
              variant={"destructive"}
              onClick={handleDisconnect}
            >
              End Interview
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
