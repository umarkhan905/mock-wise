import React from "react";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { fetchMutation } from "convex/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { Book, Clock, Info, List, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { instructions } from "@/constants";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { InterviewResultMessage } from "../../_components/InterviewResultMessage";

export default async function Interview({
  params,
}: {
  params: Promise<{ interviewId: Id<"interviews"> }>;
}) {
  const interviewId = (await params).interviewId;
  const { userId } = await auth();

  //   check if user is logged in
  if (!userId) redirect("/");

  const result = await fetchMutation(api.participants.initiateParticipant, {
    interviewId,
    userId,
  });

  switch (result.status) {
    case "unauthorized":
      return redirect("/");

    case "notFound":
      return notFound();

    case "expired":
      return <InterviewResultMessage status="expired" />;

    case "alreadyAttempted":
      return <InterviewResultMessage status="alreadyAttempted" />;

    case "scheduled":
      const scheduledDate = result?.interview?.scheduledAt;

      return (
        <InterviewResultMessage
          status="scheduled"
          scheduledDate={new Date(scheduledDate!).toString()}
        />
      );

    case "notInterviewCandidate":
      return <InterviewResultMessage status="notInterviewCandidate" />;

    case "attemptReached":
      return <InterviewResultMessage status="attemptReached" />;
  }

  const { interview, participantId } = result;

  return (
    <section className="min-h-screen px-4 py-4 sm:py-6 space-y-4 max-w-md mx-auto">
      <h1 className="text-lg font-semibold text-center text-muted-foreground">
        <span className="text-primary">Mock Wise</span> - AI Based Interview
        Simulator
      </h1>

      <div className="glass-morphism rounded-xl p-1">
        <img
          src="/logo.png"
          alt="AI Interview Assistant"
          className="rounded-lg w-full object-cover"
        />
      </div>

      <h2 className="text-2xl font-semibold text-center">{interview?.title}</h2>

      <Card className="py-3 rounded-md">
        <CardContent className="flex items-center justify-between px-2">
          {interview?.duration !== 0 ? (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="size-4" />
              <p className="text-sm ">
                {interview?.duration && interview?.duration / 60} Minutes
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Book className="size-4" />
              <p className="text-sm ">{interview?.topic}</p>
            </div>
          )}

          <div className="flex items-center gap-1 text-muted-foreground">
            <List className="size-4" />
            <p className="text-sm ">{interview?.numberOfQuestions} Questions</p>
          </div>
        </CardContent>
      </Card>

      <div className="bg-primary/10 rounded-sm p-3">
        <div className="flex flex-col gap-2">
          <span>
            <Info className="size-6 text-primary" />
          </span>

          <div className="space-y-0.5">
            <h3 className="text-lg text-primary font-semibold">
              Before you begin
            </h3>

            <p className="text-sm text-muted-foreground">
              Read the following instructions carefully before starting the
              interview.
            </p>

            <ul className="list-disc px-5 mt-2 text-muted-foreground">
              <li className="text-sm ">
                You will be asked {interview?.numberOfQuestions} questions and
                have {interview?.duration} minutes to answer them.
              </li>
              {instructions.map((instruction) => (
                <li key={instruction.id} className="text-sm">
                  {instruction.content}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Button className="w-full min-h-10" asChild>
        <Link
          href={
            interview?.assessment === "voice"
              ? `/interview/${interview?._id}/join?participantId=${participantId}`
              : `/interview/${interview?._id}/join-mcq?participantId=${participantId}`
          }
        >
          <Mic className="size-4" />
          Join Interview
        </Link>
      </Button>
    </section>
  );
}
