import React from "react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import MockWiseAgent from "@/components/agent/MockWiseAgent";

export default async function JoinInterview({
  params,
  searchParams,
}: {
  params: Promise<{ interviewId: Id<"interviews"> }>;
  searchParams: Promise<{ participantId: Id<"participants"> }>;
}) {
  const interviewId = (await params).interviewId;
  const participantId = (await searchParams).participantId;

  const clerkUser = await currentUser();

  if (!clerkUser) return redirect("/");

  const user = await fetchQuery(api.users.getUserByClerkId, {
    clerkId: clerkUser.id,
  });

  if (!user) return redirect("/");

  const interview = await fetchQuery(api.interviews.getInterviewById, {
    interviewId,
  });

  if (!interview) notFound();

  return (
    <MockWiseAgent
      position={interview.role}
      user={{
        userId: user._id,
        username: user.username,
        avatar: user?.image || "",
      }}
      type="interview"
      interviewId={interviewId}
      participantId={participantId}
      questions={interview.questions}
    />
  );
}
