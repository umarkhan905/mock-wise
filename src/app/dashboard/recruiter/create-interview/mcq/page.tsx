"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useStep } from "@/hooks/useStep";
import { jobInterviewSteps, jobInterviewTabs } from "@/constants";
import { AddDetails } from "../_components/steps/AddDetails";
import AddQuestions from "../_components/steps/AddQuestions";
import PreviewLink from "../_components/steps/PreviewLink";
import Schedule from "../_components/steps/Schedule";

export default function MCQInterview() {
  const { step } = useStep(jobInterviewSteps);

  return (
    <section className="space-y-4">
      <Button
        asChild
        className="text-white"
        size={"icon"}
        title="Back to Select Interview"
        aria-label="Back to Select Interview"
      >
        <Link href={"/dashboard/recruiter/create-interview"}>
          <ChevronLeft className="size-5" />
        </Link>
      </Button>

      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-6 gap-2">
          {jobInterviewTabs.map((tab) => (
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
        {step === "add-details" && <AddDetails assessment="mcq" />}
        {step === "add-question" && <AddQuestions assessment="mcq" />}
        {step === "schedule-interview" && <Schedule />}
        {step === "preview" && <PreviewLink />}
      </div>
    </section>
  );
}
