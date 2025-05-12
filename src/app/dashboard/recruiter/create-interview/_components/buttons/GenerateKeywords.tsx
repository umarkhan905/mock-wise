"use client";

import { Button } from "@/components/ui/button";
import { useAction } from "convex/react";
import React, { useState } from "react";
import { api } from "../../../../../../../convex/_generated/api";
import { ConvexError } from "convex/values";
import { Brain, Loader2 } from "lucide-react";

interface Props {
  formData: AddDetails;
  setFormData: React.Dispatch<React.SetStateAction<AddDetails>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function GenerateKeywords({
  formData,
  setError,
  setFormData,
}: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const generateKeywords = useAction(api.ai.generateKeywords);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const keywords = await generateKeywords({
        role: formData.role,
        title: formData.title,
        difficulty: formData.difficulty as Difficulty,
        type: formData.type,
        description: formData.description,
      });
      setFormData((prev) => ({ ...prev, keywords }));
    } catch (error) {
      console.log("Error while generating keywords", error);
      const convexError = error as ConvexError<string>;
      setError(convexError.message);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    !formData.role.trim() ||
    !formData.title.trim() ||
    !formData.difficulty.trim() ||
    !formData.type.length ||
    !formData.description.trim();

  return (
    <Button
      className="from-blue-600 to-purple-600 bg-gradient-to-r rounded-full"
      disabled={loading || isDisabled}
      onClick={handleClick}
      size={"icon"}
    >
      {loading ? (
        <Loader2 className="size-5 animate-spin" />
      ) : (
        <Brain className="size-5" />
      )}
    </Button>
  );
}
