"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { AddDetailsForm } from "../forms/AddDetailsForm";
import { useAuthContext } from "@/context/AuthStore";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { getLocalStorage, setLocalStorage } from "@/utils/localstorage";
import { useStep } from "@/hooks/useStep";
import { ConvexError } from "convex/values";
import { jobInterviewSteps } from "@/constants";

interface Props {
  assessment: Assessment;
}

export function AddDetails({ assessment }: Props) {
  const [formData, setFormData] = useState<AddDetails>({
    title: "",
    description: "",
    role: "",
    type: [],
    difficulty: "",
    keywords: [],
    experience: "",
    experienceIn: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [interviewId, setInterviewId] = useState<Id<"interviews">>();

  // step-hook
  const { nextStep } = useStep(jobInterviewSteps);

  // context
  const { user } = useAuthContext();

  // mutations and queries
  const createInterview = useMutation(api.interviews.createJobInterview);
  const updateInterview = useMutation(api.interviews.updateJobInterview);
  const interview = useQuery(
    api.interviews.getInterviewById,
    interviewId ? { interviewId } : "skip"
  );

  const handleCreateInterview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // check if user does not exists
    if (!user) return;

    // create new interview
    try {
      const interviewId = await createInterview({
        title: formData.title,
        description: formData.description,
        role: formData.role,
        type: formData.type,
        difficulty: formData.difficulty as Difficulty,
        keywords: formData.keywords,
        experience: parseInt(formData.experience),
        experienceIn: formData.experienceIn as ExperienceIn,
        createdById: user._id,
        assessment,
        category: "job",
        createdByRole: "recruiter",
      });
      setLocalStorage("interviewId", interviewId);
      nextStep();
    } catch (error) {
      console.log("Error while creating interview", error);
      const convexError = error as ConvexError<string>;
      setError(convexError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInterview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // check if interview does not exists
    if (!interview) return setLoading(false);

    // update interview
    try {
      await updateInterview({
        title: formData.title,
        description: formData.description,
        role: formData.role,
        type: formData.type,
        difficulty: formData.difficulty as Difficulty,
        keywords: formData.keywords,
        experience: parseInt(formData.experience),
        experienceIn: formData.experienceIn as ExperienceIn,
        interviewId: interview._id,
      });
      nextStep();
    } catch (error) {
      console.log("Error while updating interview", error);
      const convexError = error as ConvexError<string>;
      setError(convexError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interviewId = getLocalStorage("interviewId");
    if (interviewId) setInterviewId(interviewId as Id<"interviews">);
  }, []);

  useEffect(() => {
    if (interview) {
      setFormData({
        title: interview.title,
        description: interview?.description || "",
        role: interview.role,
        type: interview.type,
        difficulty: interview.difficulty,
        keywords: interview.keywords,
        experience: interview.experience.toString(),
        experienceIn: interview.experienceIn,
      });
    }
  }, [interview]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Interview Details</CardTitle>
        <CardDescription>
          Set up the basic information for your interview
        </CardDescription>
      </CardHeader>

      <CardContent>
        <AddDetailsForm
          loading={loading}
          error={error}
          formData={formData}
          onSubmit={interview ? handleUpdateInterview : handleCreateInterview}
          setFormData={setFormData}
          setError={setError}
        />
      </CardContent>
    </Card>
  );
}
