"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function CreateInterview() {
  const [active, setActive] = useState<"topic" | "job" | null>(null);
  const router = useRouter();

  const handleClickNext = () => {
    if (!active) return;
    router.push(`/dashboard/candidate/create-interview/${active}`);
  };

  return (
    <div className="w-full flex items-center justify-center min-h-[calc(100vh-104px)]">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create Interview</CardTitle>
          <CardDescription className="">
            Select the type of interview you want to create
          </CardDescription>
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4">
          {/* MCQ */}
          <div
            className={`border p-2 rounded-md flex items-center justify-center min-h-40  cursor-pointer ${active === "topic" ? "bg-primary/20 text-primary" : "bg-primary/10"}`}
            onClick={() =>
              setActive((prev) => (prev === "topic" ? null : "topic"))
            }
          >
            <span className="font-semibold">Topic Based</span>
          </div>

          {/* Voice */}
          <div
            className={`border p-2 rounded-md flex items-center justify-center min-h-40  cursor-pointer ${active === "job" ? "bg-primary/20 text-primary" : "bg-primary/10"}`}
            onClick={() => setActive((prev) => (prev === "job" ? null : "job"))}
          >
            <span className="font-semibold">Job Based</span>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            className="w-full min-h-10 text-white"
            disabled={!active}
            onClick={handleClickNext}
          >
            Next
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
