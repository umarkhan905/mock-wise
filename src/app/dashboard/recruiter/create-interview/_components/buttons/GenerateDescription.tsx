"use client";

import { Button } from "@/components/ui/button";
import { useAction } from "convex/react";
import { Brain, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { api } from "../../../../../../../convex/_generated/api";
import { ConvexError } from "convex/values";

interface Props {
  formData: AddDetails;
  setFormData: React.Dispatch<React.SetStateAction<AddDetails>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  className?: string;
}

export default function GenerateDescription({
  formData,
  setFormData,
  setError,
  className,
}: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const generateDescription = useAction(api.ai.generateDescription);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const description = await generateDescription({
        role: formData.role,
        title: formData.title,
      });
      setFormData((prev) => ({ ...prev, description }));
    } catch (error) {
      console.log("Error while generating description", error);
      const convexError = error as ConvexError<string>;
      setError(convexError.message);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !formData.title.trim() || !formData.role.trim();
  return (
    <Button
      className={`min-h-10 from-blue-600 to-purple-600 bg-gradient-to-r ${className}`}
      disabled={loading || isDisabled}
      onClick={handleClick}
    >
      {loading ? (
        <Loader2 className="size-5 animate-spin" />
      ) : (
        <Brain className="size-5" />
      )}
    </Button>
  );
}
