"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDebounceCallback } from "usehooks-ts";
import { Id } from "../../../../../../../../../convex/_generated/dataModel";
import { SearchCandidates } from "./SearchCandidates";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  triggerClassName?: string;
  interviewId: Id<"interviews">;
  existingCandidatesIds: { userId: Id<"users">; status: string }[];
}

export function InviteCandidateModal({
  interviewId,
  existingCandidatesIds,
  triggerClassName,
}: Props) {
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
        <Button className={`min-h-10 ${triggerClassName}`}>
          <Plus className="size-5 text-white" />
          <span className="text-white">Add Candidates</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto max-h-[90vh] scrollbar-hide z-[99999]">
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
            existingCandidatesIds={existingCandidatesIds}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
