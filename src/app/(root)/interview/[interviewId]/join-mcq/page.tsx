import MockWiseMcqAgent from "@/components/agent/mcq-agent/MockWiseMcqAgent";
import React from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";

export default async function JoinMCQs({
  params,
  searchParams,
}: {
  params: Promise<{ interviewId: Id<"interviews"> }>;
  searchParams: Promise<{ participantId: Id<"participants"> }>;
}) {
  const interviewId = (await params).interviewId;
  const participantId = (await searchParams).participantId;

  return (
    <MockWiseMcqAgent interviewId={interviewId} participantId={participantId} />
  );
}
