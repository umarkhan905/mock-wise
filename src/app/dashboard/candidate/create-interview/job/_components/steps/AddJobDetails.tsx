"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import { api } from "../../../../../../../../convex/_generated/api";
import { useAuthContext } from "@/context/AuthStore";
import { useStep } from "@/hooks/useStep";
import {
  difficultyLevels,
  experienceIn,
  interviewTypes,
  mockInterviewSteps,
} from "@/constants";
import { getLocalStorage, setLocalStorage } from "@/utils/localstorage";
import { ConvexError } from "convex/values";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FormError from "@/components/error/FormError";
import { ArrowRight, Loader2 } from "lucide-react";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import { Textarea } from "@/components/ui/textarea";
import GenerateDescription from "../buttons/GenerateDescription";
import { Difficulty, ExperienceIn } from "@/types";
import { toast } from "sonner";

interface FormData {
  title: string;
  role: string;
  experience: string;
  experienceIn: string;
  type: string[];
  difficulty: string;
  description: string;
}

export function AddJobInterviewDetails() {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    role: "",
    experience: "",
    experienceIn: "",
    type: [],
    difficulty: "",
    description: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [interviewId, setInterviewId] = useState<Id<"interviews">>();

  const createInterview = useMutation(api.interviews.createJobInterview);
  const updateInterview = useMutation(api.interviews.updateJobInterview);
  const interview = useQuery(
    api.interviews.getInterviewById,
    interviewId ? { interviewId } : "skip"
  );
  const generateKeywords = useAction(api.ai.generateKeywords);

  const { user } = useAuthContext();

  const { nextStep } = useStep(mockInterviewSteps);

  const handleFormDataChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleArrayFormDataChange = (
    id: "type",
    value: string,
    action: "add" | "remove"
  ) => {
    if (action === "remove") {
      return setFormData((prev) => ({
        ...prev,
        [id]: prev[id].filter((item) => item !== value),
      }));
    }

    return setFormData((prev) => ({ ...prev, [id]: [...prev[id], value] }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // check if user does not exists
    if (!user) return;

    const generatedKeywords = await generateKeywords({
      title: formData.title,
      role: formData.role,
      type: formData.type,
      difficulty: formData.difficulty as Difficulty,
      description: formData.description,
    });

    try {
      const interviewId = await createInterview({
        title: formData.title,
        experience: parseInt(formData.experience),
        experienceIn: formData.experienceIn as ExperienceIn,
        type: formData.type,
        difficulty: formData.difficulty as Difficulty,
        createdById: user._id,
        assessment: "voice",
        role: formData.role,
        keywords: generatedKeywords,
        description: formData.description,
        category: "mock",
        createdByRole: "candidate",
      });

      setLocalStorage("interviewId", interviewId);
      nextStep();
    } catch (error) {
      console.log("Error while creating interview", error);
      const convexError = error as ConvexError<string>;

      const interviewLimitError =
        "Interview limit reached! Please upgrade your plan or buy more interview";

      // check if error message contains interview limit error
      if (convexError.message.includes(interviewLimitError)) {
        toast.error(interviewLimitError);
        return setError(interviewLimitError);
      }

      // set error
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

    const generatedKeywords = await generateKeywords({
      title: formData.title,
      role: formData.role,
      type: formData.type,
      difficulty: formData.difficulty as Difficulty,
      description: formData.description,
    });

    // update interview
    try {
      await updateInterview({
        title: formData.title,
        type: formData.type,
        difficulty: formData.difficulty as Difficulty,
        experience: parseInt(formData.experience),
        experienceIn: formData.experienceIn as ExperienceIn,
        keywords: generatedKeywords,
        role: formData.role,
        description: formData.description,
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
        type: interview.type,
        difficulty: interview.difficulty,
        experience: interview.experience.toString(),
        experienceIn: interview.experienceIn,

        role: interview.role,
        description: interview.description!,
      });
    }
  }, [interview]);

  const isButtonDisabled = Object.values(formData).some(
    (value) => value === "" || value.length === 0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Interview Details</CardTitle>
        <CardDescription>
          Set up the basic information for your interview
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={interview ? handleUpdateInterview : onSubmit}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Interview Title</Label>
            <Input
              id="title"
              type="text"
              className="min-h-10 bg-muted"
              placeholder="e.g. Software Engineer Interview"
              value={formData.title}
              onChange={handleFormDataChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Interview Role</Label>
            <Input
              id="role"
              type="text"
              className="min-h-10 bg-muted"
              placeholder="e.g. Software Engineer"
              value={formData.role}
              onChange={handleFormDataChange}
            />
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              className="min-h-30 resize-none bg-muted"
              placeholder="Describe the purpose and scope of the interview..."
              value={formData.description}
              onChange={handleFormDataChange}
            />

            <GenerateDescription
              formData={formData}
              setFormData={setFormData}
              setError={setError}
              className="absolute right-2 top-8"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <div className="flex flex-wrap gap-2 items-center">
              {interviewTypes.map((type) => (
                <Button
                  type="button"
                  key={type.state}
                  variant={"outline"}
                  className={`rounded-full  ${formData.type.includes(type.state) ? "bg-primary/20 hover:bg-primary/20 hover:text-white" : "hover:bg-background hover:text-foreground"}`}
                  size={"lg"}
                  onClick={() =>
                    formData.type.includes(type.state)
                      ? handleArrayFormDataChange("type", type.state, "remove")
                      : handleArrayFormDataChange("type", type.state, "add")
                  }
                >
                  <type.icon />
                  <span>{type.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <div id="difficulty" className="flex flex-wrap gap-2 items-center">
              {difficultyLevels.map((type) => (
                <Button
                  type="button"
                  key={type.state}
                  variant={"outline"}
                  className={`rounded-full  ${formData.difficulty === type.state ? "bg-primary/20 hover:bg-primary/20 hover:text-white" : "hover:bg-background hover:text-foreground"}`}
                  size={"lg"}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      difficulty: type.state,
                    }))
                  }
                >
                  <type.icon />
                  <span>{type.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Experience</Label>
            <Input
              id="experience"
              type="number"
              className="min-h-10 bg-muted"
              placeholder="e.g. 2"
              value={formData.experience}
              onChange={handleFormDataChange}
              min={0}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Experience In</Label>
            <div id="difficulty" className="flex flex-wrap gap-2 items-center">
              {experienceIn.map((type) => (
                <Button
                  type="button"
                  key={type.state}
                  variant={"outline"}
                  className={`rounded-full  ${formData.experienceIn === type.state ? "bg-primary/20 hover:bg-primary/20 hover:text-white" : "hover:bg-background hover:text-foreground"}`}
                  size={"lg"}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      experienceIn: type.state,
                    }))
                  }
                >
                  <type.icon />
                  <span>{type.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {error && <FormError message={error} />}

          <div className="flex justify-end">
            <Button
              type="submit"
              className="min-h-10 text-white min-w-22"
              disabled={isButtonDisabled || loading}
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
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
