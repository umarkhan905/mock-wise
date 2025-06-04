import { SuccessCard } from "@/components/billing/SuccessCard";
import { Plan } from "@/types";
import React from "react";

export default async function SubscriptionSuccess({
  searchParams,
}: {
  searchParams: Promise<{
    session_id: string;
    plan: string;
  }>;
}) {
  const { session_id: sessionId, plan } = await searchParams;
  return (
    <div className="min-h-[calc(100vh-104px)] flex items-center justify-center px-4">
      <SuccessCard
        plan={plan as Plan}
        sessionId={sessionId}
        redirectUrl="/dashboard/recruiter/billing"
        type="subscription"
      />
    </div>
  );
}
