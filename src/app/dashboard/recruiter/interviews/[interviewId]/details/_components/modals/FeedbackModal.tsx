import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Feedback, Participant, User } from "@/types";
import React from "react";

interface Props {
  open: boolean;
  feedback: Feedback | undefined;
  user: User | null | undefined;
  participant: Participant;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function FeedbackModal({
  open,
  feedback,
  participant,
  user,
  setOpen,
}: Props) {
  if (!user || !feedback) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="h-[80vh] z-[99999]! overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle>Candidate Feedback</DialogTitle>
          <DialogDescription>
            Provide feedback for {user.username}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.image || ""} alt={"Avatar"} />
            <AvatarFallback className="flex items-center justify-center bg-primary/20 text-primary">
              {user.username.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-sm text-foreground">
              {user.username}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Date</p>
            <p>
              {new Date(
                participant.completedAt || Date.now()
              ).toLocaleDateString()}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Rating</p>
            <p> {feedback?.totalRating || 0}/10</p>
          </div>
        </div>

        {/* Summary */}
        <section className="space-y-1">
          <h2 className="text-foreground  font-semibold">Summary:</h2>
          <p className="text-sm">{feedback?.summary}</p>
        </section>

        {/* Breakdown of evaluations */}
        <section className="space-y-1">
          <h2 className="text-foreground  font-semibold">
            Breakdown of Evaluation:
          </h2>

          <div className="space-y-2">
            {feedback?.rating.map((rating, index) => (
              <div key={index} className="space-y-1">
                <h3 className="text-foreground text-sm font-semibold">
                  {index + 1}. {rating.name} <span>({rating.score}/10)</span>
                </h3>
                <ul>
                  <li className="text-sm">- {rating.comment}</li>
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* strngths */}
        <section className="space-y-1">
          <h2 className="text-foreground  font-semibold">Strengths:</h2>
          <p className="text-sm">{feedback?.strengths}</p>
        </section>

        {/* weaknesses */}
        <section className="space-y-1">
          <h2 className="text-foreground  font-semibold">Weaknesses:</h2>
          <p className="text-sm">{feedback?.weaknesses}</p>
        </section>

        {/* improvements */}
        <section className="space-y-1">
          <h2 className="text-foreground  font-semibold">Improvements:</h2>
          <p className="text-sm">{feedback?.improvements}</p>
        </section>

        {/* final assessment */}
        <section className="space-y-1">
          <div className=" flex items-center flex-wrap gap-2">
            <h2 className="text-foreground  font-semibold">Final Verdict:</h2>
            {/* recommended for job or not */}
            <div
              className={`px-4 py-1 rounded-full ${feedback?.recommendedForJob ? "bg-emerald-500/20 text-lime-500" : "bg-destructive/20 text-destructive"} text-sm font-medium capitalize`}
            >
              {feedback?.recommendedForJob ? "Recommended" : "Not Recommended"}
            </div>
          </div>
          <p className="text-sm">{feedback?.assessment}</p>
        </section>
      </DialogContent>
    </Dialog>
  );
}
