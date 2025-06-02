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

interface Props {
  pack: string;
  sessionId: string;
  interviewCredits: string;
  redirectUrl: string;
}

export function SuccessCard({
  pack,
  sessionId,
  interviewCredits,
  redirectUrl,
}: Props) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <BadgeCheck className="text-green-600 size-10 mx-auto" />

        <div className="text-center">
          <CardTitle className="text-lg">Payment Successful</CardTitle>
          <CardDescription>
            You’ve purchased the {pack}. {interviewCredits} interview credits
            will be added to your account.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/20 p-4 rounded-lg text-xs text-primary break-all">
          <span className="font-medium">Transaction ID:</span> {sessionId}
        </div>
        <Button asChild className="w-full min-h-10 text-white">
          <Link href={redirectUrl}>Browse more interview packs</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
