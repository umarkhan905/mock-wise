"use client";

import { useMutation, useQuery } from "convex/react";
import React, { useEffect, useState } from "react";
import { api } from "../../../../../../../../convex/_generated/api";
import { useAuthContext } from "@/context/AuthStore";
import { useStep } from "@/hooks/useStep";
import {
  difficultyLevels,
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
import { Difficulty } from "@/types";
import { toast } from "sonner";

interface FormData {
  title: string;
  topic: string;
  type: string[];
  difficulty: string;
}

export function AddTopicDetails() {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    topic: "",
    type: [],
    difficulty: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [interviewId, setInterviewId] = useState<Id<"interviews">>();

  const createInterview = useMutation(api.interviews.createTopicInterview);
  const updateInterview = useMutation(api.interviews.updateTopicInterview);
  const interview = useQuery(
    api.interviews.getInterviewById,
    interviewId ? { interviewId } : "skip"
  );

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

    try {
      const interviewId = await createInterview({
        title: formData.title,
        topic: formData.topic,
        type: formData.type,
        difficulty: formData.difficulty as Difficulty,
        createdById: user._id,
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

    // update interview
    try {
      await updateInterview({
        title: formData.title,
        type: formData.type,
        difficulty: formData.difficulty as Difficulty,
        topic: formData.topic,
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
        topic: interview.topic!,
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
              placeholder="e.g. React Hooks Interview"
              value={formData.title}
              onChange={handleFormDataChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Interview Topic</Label>
            <Input
              id="topic"
              type="text"
              className="min-h-10 bg-muted"
              placeholder="e.g. React Hooks"
              value={formData.topic}
              onChange={handleFormDataChange}
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
