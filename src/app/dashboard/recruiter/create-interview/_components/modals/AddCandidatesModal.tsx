"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { SearchCandidates } from "./SearchCandidates";
import { Id } from "../../../../../../../convex/_generated/dataModel";

interface Props {
  interviewId: Id<"interviews">;
  scheduledAt: string;
}

export function AddCandidatesModal({ interviewId, scheduledAt }: Props) {
  const [search, setSearch] = useState<string>("");

  const debounced = useDebounceCallback(setSearch, 300);

  const onOpenChange = (open: boolean) => {
    if (!open) {
      setSearch("");
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="min-h-10 w-full">
          <span className="text-white">Add Candidates</span>
          <Plus className="size-5 text-white" />
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto max-h-[90vh] scrollbar-hide">
        <DialogHeader>
          <DialogTitle>Add Candidates</DialogTitle>
          <DialogDescription>
            Find and add candidates to your interview. You can search for users
            by their username or email.
          </DialogDescription>
        </DialogHeader>

        {/* search bar */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search for candidates by username or email..."
            className="w-full min-h-12"
            defaultValue={search}
            onChange={(e) => {
              debounced(e.target.value);
            }}
          />
        </div>

        {/* search results */}
        {search && (
          <SearchCandidates
            searchTerm={search}
            interviewId={interviewId}
            scheduledAt={scheduledAt}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
