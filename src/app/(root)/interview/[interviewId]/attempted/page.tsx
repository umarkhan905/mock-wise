import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import React from "react";

export default function Attempted() {
  return (
    <section className="flex items-center justify-center min-h-screen">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle className="text-2xl">
            Interview Already Attempted
          </CardTitle>
          <CardDescription>
            You have already completed this interview. Duplicate submissions are
            not allowed for Job Interviews. Contact your interviewer for a new
            interview link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button asChild className="text-white min-h-11 rounded-full w-full">
            <Link href="/dashboard/candidate">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}
