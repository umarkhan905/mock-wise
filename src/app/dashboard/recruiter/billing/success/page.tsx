import { SuccessCard } from "@/components/billing/SuccessCard";
import React from "react";

export default async function Success({
  searchParams,
}: {
  searchParams: Promise<{
    session_id: string;
    pack: string;
    interviewCredits: string;
  }>;
}) {
  const { pack, session_id: sessionId, interviewCredits } = await searchParams;

  return (
    <div className="min-h-[calc(100vh-104px)] flex items-center justify-center px-4">
      <SuccessCard
        pack={pack}
        sessionId={sessionId}
        interviewCredits={interviewCredits}
        redirectUrl="/dashboard/recruiter/billing"
      />
    </div>
  );
}
