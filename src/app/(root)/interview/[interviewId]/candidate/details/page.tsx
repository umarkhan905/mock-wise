"use client";

import { useQuery } from "convex/react";
import { notFound, redirect, useParams } from "next/navigation";
import React from "react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@clerk/nextjs";

export default function Details() {
  const { interviewId } = useParams() as { interviewId: Id<"interviews"> };
  const { userId: clerkUserId, isLoaded: isAuthLoaded } = useAuth();

  const user = useQuery(
    api.users.getUserByClerkId,
    clerkUserId ? { clerkId: clerkUserId } : "skip"
  );

  const interview = useQuery(
    api.interviews.getInterviewById,
    interviewId ? { interviewId } : "skip"
  );

  const participants = useQuery(
    api.participants.getUserInterviewParticipation,
    interviewId && user ? { interviewId, userId: user._id } : "skip"
  );

  if (
    interview === undefined ||
    participants === undefined ||
    !isAuthLoaded ||
    user === undefined
  ) {
    return (
      <section className="max-w-xl p-4 py-6 mx-auto space-y-6">
        <h1 className="text-center font-bold text-2xl md:text-3xl text-foreground capitalize">
          Loading...
        </h1>
      </section>
    );
  }

  if (user === null) redirect("/");

  if (interview === null) notFound();

  return (
    <section className="max-w-xl p-4 py-6 mx-auto space-y-6">
      <h1 className="text-center font-bold text-2xl md:text-3xl text-foreground capitalize">
        {interview?.title} — <br />
        <span className="capitalize">{interview?.type[0]} Interview</span>
      </h1>

      <Separator />

      <div className="space-y-2">
        <h2 className="text-foreground text-lg md:text-xl font-semibold">
          Description:
        </h2>
        <p className="text-sm md:text-base">{interview?.description}</p>
      </div>

      <div className="space-y-2">
        <h2 className="text-foreground text-lg md:text-xl font-semibold">
          Related Keywords:
        </h2>
        <div className="flex flex-wrap gap-2">
          {interview?.keywords?.map((kw) => (
            <Badge
              variant="outline"
              className={`bg-primary/20 text-primary p-1 rounded-full px-4`}
              key={kw.trim()}
            >
              {kw.trim()}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-foreground text-lg md:text-xl font-semibold">
          Sample Questions:
        </h2>
        <ScrollArea className="h-48 border rounded-md p-4">
          <ul className="list-disc pl-4 space-y-2">
            {interview?.questions?.map((q, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                {q.question}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>

      <div className="space-y-2">
        <h3 className="text-foreground text-lg md:text-xl font-semibold">
          Attempts ({participants?.length}):
        </h3>

        {participants && participants?.length > 0 ? (
          <section className="space-y-3">
            {participants.map(({ participant, user, feedback }) => (
              <div
                key={participant._id}
                className="flex items-center justify-between bg-bg-muted p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <Link href={`/profile/${participant.userId}`}>
                    <Avatar className="size-12">
                      <AvatarImage src={user?.image || ""} alt={"Avatar"} />
                      <AvatarFallback className="flex items-center justify-center bg-primary/20 text-primary">
                        {user?.username?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <p className="font-medium text-sm text-foreground">
                      {user?.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {participant?.status === "completed" ? (
                        <span>
                          Completed on{" "}
                          {new Date(participant.completedAt!).toDateString()}
                        </span>
                      ) : participant?.status === "pending" ? (
                        <span>Not started yet</span>
                      ) : (
                        <span>
                          Started on{" "}
                          {new Date(participant.completedAt!).toDateString()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {participant.status === "completed" ? (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={"outline"}
                      className="text-emerald-500 bg-emerald-500/20 rounded-full p-1 px-4"
                    >
                      {feedback?.totalRating}/10
                    </Badge>
                    <Button
                      size="sm"
                      className="rounded-full text-white"
                      asChild
                    >
                      <Link
                        href={`/interview/${interview?._id}/feedback/${feedback?._id}`}
                      >
                        View Report
                      </Link>
                    </Button>
                  </div>
                ) : participant.status === "pending" ? (
                  <Badge
                    variant={"outline"}
                    className="text-yellow-500 bg-yellow-500/20 rounded-full p-1 px-4"
                  >
                    Pending
                  </Badge>
                ) : (
                  <Badge
                    variant={"outline"}
                    className="text-primary bg-primary/20 rounded-full p-1 px-4"
                  >
                    In Progress
                  </Badge>
                )}
              </div>
            ))}
          </section>
        ) : (
          <Card className="py-4 gap-3">
            <CardHeader className="px-4">
              <CardTitle className="">No attempts yet</CardTitle>
              <CardDescription>
                Start your interview to make your first attempt.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4">
              <Button className="w-full text-white min-h-10" asChild>
                <Link href={`/interview/${interview._id}`}>
                  Start Interview
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
