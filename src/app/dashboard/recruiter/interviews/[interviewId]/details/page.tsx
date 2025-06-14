import React from "react";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { InterviewDetails } from "./_components/InterviewDetails";

export default async function InterviewDetailsPage({
  params,
}: {
  params: Promise<{ interviewId: Id<"interviews"> }>;
}) {
  const interviewId = (await params).interviewId;
  return <InterviewDetails interviewId={interviewId} />;
}
