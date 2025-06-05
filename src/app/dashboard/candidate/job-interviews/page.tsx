"use client";

import { useQuery } from "convex/react";
import React, { useState } from "react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { RecruiterFilters } from "@/types";
import { defaultRecruiterFilters } from "@/constants";
import { InterviewCard } from "./_components/InterviewCard";
import InterviewFilters from "./_components/InterviewFilters";
import { useAuthContext } from "@/context/AuthStore";
import { InterviewLoader } from "@/components/dashboard/interviews/InterviewLoader";

export default function JobInterviews() {
  const [search, setSearch] = useState<string>("");
  const [filters, setFilters] = useState<RecruiterFilters>(
    defaultRecruiterFilters
  );

  const { user } = useAuthContext();

  const interviews = useQuery(
    api.candidates.getCandidateJobInterviews,
    user
      ? {
          userId: user._id,
          status: filters.status === "all" ? undefined : filters.status,
          assessment:
            filters.assessment === "all" ? undefined : filters.assessment,
          difficulty:
            filters.difficulty === "all" ? undefined : filters.difficulty,
          experienceIn:
            filters.experience === "all" ? undefined : filters.experience,
          orderBy: filters.oderBy,
        }
      : "skip"
  );

  const filteredInterviews =
    interviews &&
    interviews.filter((interview) => {
      return interview.title.toLowerCase().includes(search.toLowerCase());
    });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Job Interviews</h1>
        <Button asChild className="text-white min-h-10">
          <Link href="/dashboard/candidate/create-interview">
            <Plus className="size-5 mr-2" />
            <span>Create Interview</span>
          </Link>
        </Button>
      </div>

      <InterviewFilters
        filters={filters}
        setFilters={setFilters}
        search={search}
        setSearch={setSearch}
      />

      <div className="space-y-4">
        {interviews === undefined && <InterviewLoader />}
        {filteredInterviews && filteredInterviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInterviews.map((interview) => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                user={{
                  companyName: user?.companyName,
                }}
              />
            ))}
          </div>
        ) : (
          filteredInterviews && (
            <div className="min-h-[calc(100vh-235px)] flex items-center justify-center flex-col">
              <span className="text-4xl mb-2">🤔</span>
              <p className="text-muted-foreground text-sm">
                No interviews found. Try adjusting your filters.
              </p>
            </div>
          )
        )}
      </div>
    </section>
  );
}
