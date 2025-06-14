"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, Bot, User2 } from "lucide-react";
import React, { useState } from "react";
import { FeedbackModal } from "../modals/FeedbackModal";
import { Id } from "../../../../../../../../../convex/_generated/dataModel";
import { Feedback, Participant, User } from "@/types";
import Link from "next/link";

type InvitedCandidate = {
  participant: Participant;
  user?: User | null;
  feedback?: Feedback;
};

interface Props {
  participants: InvitedCandidate[];
  interviewId: Id<"interviews">;
}

export function Attempts({ participants, interviewId }: Props) {
  const [openFeedbackModal, setOpenFeedbackModal] = useState<boolean>(false);
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Attempts</CardTitle>
          <CardDescription>
            List of attempts who have been invited to this interview
          </CardDescription>
        </CardHeader>

        <CardContent>
          {participants.length > 0 ? (
            <section className="space-y-3">
              {participants.map(({ participant, user, feedback }) => (
                <div
                  key={participant._id}
                  className="space-y-4 p-3 rounded-lg border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12">
                        <AvatarImage src={user?.image || ""} alt={"Avatar"} />
                        <AvatarFallback className="flex items-center justify-center bg-primary/20 text-primary">
                          {user?.username?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {user?.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {participant?.status === "completed" ? (
                            <span>
                              Completed on{" "}
                              {new Date(
                                participant.completedAt!
                              ).toDateString()}
                            </span>
                          ) : participant?.status === "pending" ? (
                            <span>Not started yet</span>
                          ) : (
                            <span>
                              Started on{" "}
                              {new Date(participant.startedAt!).toDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {participant.status === "completed" ? (
                      <div className="flex items-center gap-2">
                        <Badge
                          className="rounded-full px-4 py-1"
                          variant="outline"
                        >
                          {feedback?.totalRating || 0}/10
                        </Badge>
                        <Badge
                          variant={"outline"}
                          className="text-emerald-500 bg-emerald-500/20 rounded-full p-1 px-4"
                        >
                          Completed
                        </Badge>
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

                  {participant.status === "pending" ? (
                    <Button variant="outline" asChild>
                      <Link href={`/interview/${interviewId}`}>
                        Join Interview
                        <ArrowRight className="size-5" />
                      </Link>
                    </Button>
                  ) : participant.status === "completed" ? (
                    <Button
                      variant="outline"
                      onClick={() => setOpenFeedbackModal(true)}
                    >
                      <Bot className="size-5" />
                      View Feedback
                    </Button>
                  ) : null}

                  <FeedbackModal
                    open={openFeedbackModal}
                    feedback={feedback}
                    user={user}
                    participant={participant}
                    setOpen={setOpenFeedbackModal}
                  />
                </div>
              ))}
            </section>
          ) : (
            <div className="space-y-2 mt-3 max-w-md mx-auto border rounded-md p-3 text-center">
              <User2 className="size-8 mx-auto" />
              <p className="text-sm text-muted-foreground">No attempts found</p>
              <Button asChild className="w-full text-white">
                <Link href={`/interview/${interviewId}`}>
                  Join Interview <ArrowRight className="size-5" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
