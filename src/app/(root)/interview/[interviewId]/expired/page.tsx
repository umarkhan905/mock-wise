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

export default function Expired() {
  return (
    <section className="flex items-center justify-center min-h-screen">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Interview Link Expired</CardTitle>
          <CardDescription>
            This interview link has expired or is no longer active. Please
            contact your interviewer for a new link.
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
