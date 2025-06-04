import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { BadgeCheck } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Plan } from "@/types";

interface Props {
  sessionId: string;
  redirectUrl: string;
  pack?: string;
  interviewCredits?: string;
  type?: "pack" | "subscription";
  plan?: Plan;
}

export function SuccessCard({
  pack,
  sessionId,
  interviewCredits,
  redirectUrl,
  type = "pack",
}: Props) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <BadgeCheck className="text-green-600 size-10 mx-auto" />

        <div className="text-center">
          <CardTitle className="text-lg">Payment Successful</CardTitle>
          {type === "pack" ? (
            <CardDescription>
              You’ve purchased the {pack}. {interviewCredits} interview credits
              will be added to your account.
            </CardDescription>
          ) : (
            <CardDescription>
              You have successfully subscribed to the {pack} plan.
            </CardDescription>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/20 p-4 rounded-lg text-xs text-primary break-all">
          <span className="font-medium">Transaction ID:</span> {sessionId}
        </div>
        <Button asChild className="w-full min-h-10 text-white">
          <Link href={redirectUrl}>
            {type === "subscription"
              ? "Browse more plans"
              : "Browse more interview packs"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
