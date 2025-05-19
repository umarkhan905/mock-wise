"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { mockInterviewSteps, mockInterviewTabs } from "@/constants";
import { ChevronLeft } from "lucide-react";
import { useStep } from "@/hooks/useStep";
import { AddTopicDetails } from "./_components/steps/AddDetails";
import { AddTopicQuestions } from "./_components/steps/AddQuestions";
import { PreviewTopicInterview } from "./_components/steps/PreviewTopicInterview";

export default function Topic() {
  const { step } = useStep(mockInterviewSteps);

  return (
    <section className="space-y-4">
      <Button
        asChild
        className="text-white"
        size={"icon"}
        title="Back to Select Interview"
        aria-label="Back to Select Interview"
      >
        <Link href={"/dashboard/candidate/create-interview"}>
          <ChevronLeft className="size-5" />
        </Link>
      </Button>

      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-6 gap-2">
          {mockInterviewTabs.map((tab) => (
            <button
              key={tab.state}
              className={`py-2 px-2 lg:px-4 font-medium border-b-2  ${
                step === tab.state
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Forms */}
        {step === "add-details" && <AddTopicDetails />}
        {step === "add-question" && <AddTopicQuestions />}
        {step === "preview" && <PreviewTopicInterview />}
      </div>
    </section>
  );
}
