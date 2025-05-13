"use client";

import React from "react";
import { Id } from "../../../convex/_generated/dataModel";
import { Captions, Phone } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

interface User {
  userId: Id<"users">;
  username: string;
  avatar: string;
}

interface Props {
  messages: SavedMessage[];
  lastMessage: string;
  isSpeaking: boolean;
  user: User;
  type: "generate" | "interview";
  handleDisconnect: () => void;
}

export default function AgentScreen({
  isSpeaking,
  messages,
  lastMessage,
  user,
  type = "generate",
  handleDisconnect,
}: Props) {
  const callEnded = false;
  const callActive = false;
  const connecting = true;
  return (
    <section className="flex flex-col min-h-screen text-foreground overflow-hidden py-6">
      <div className="container mx-auto px-4 h-full max-w-5xl">
        {/* Title */}
        {type === "generate" && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-mono">
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
          <div className="w-full bg-card/90 backdrop-blur-sm border border-border rounded-xl p-4 mb-8 h-16 flex items-center justify-center">
            <p className="text-foreground">{lastMessage}</p>
          </div>
        )}

        {/* CALL CONTROLS */}
        {type === "generate" && (
          <div className="w-full flex justify-center gap-4">
            <Button
              className={`w-40 text-xl rounded-3xl ${
                callActive
                  ? "bg-destructive hover:bg-destructive/90"
                  : callEnded
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-primary hover:bg-primary/90"
              } text-white relative`}
            >
              {connecting && (
                <span className="absolute inset-0 rounded-full animate-ping bg-primary/50 opacity-75"></span>
              )}

              <span>
                {callActive
                  ? "End Call"
                  : connecting
                    ? "Connecting..."
                    : callEnded
                      ? "View Profile"
                      : "Start Call"}
              </span>
            </Button>
          </div>
        )}

        {type === "interview" && (
          <div className="flex items-center justify-center gap-4">
            <Button
              size={"icon"}
              variant={"destructive"}
              className="rounded-full"
              title="End Call"
              onClick={handleDisconnect}
            >
              <Phone className="size-5" />
            </Button>

            <Button
              size={"icon"}
              variant={"outline"}
              className="rounded-full"
              title="Captions"
            >
              <Captions className="size-5" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
