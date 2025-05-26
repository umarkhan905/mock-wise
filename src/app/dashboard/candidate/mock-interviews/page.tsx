"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { CandidateFilters } from "@/types";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { defaultCandidateFilters } from "@/constants";
import { InterviewFilters } from "./_components/InterviewFilters";
import { InterviewCard } from "./_components/InterviewCard";

export default function Interviews() {
  const [search, setSearch] = useState<string>("");
  const [filters, setFilters] = useState<CandidateFilters>(
    defaultCandidateFilters
  );

  // query
  const { userId, isLoaded } = useAuth();

  const user = useQuery(
    api.users.getUserByClerkId,
    userId ? { clerkId: userId } : "skip"
  );

  const interviews = useQuery(
    api.candidates.getCandidateMockInterviews,
    user
      ? {
          userId: user._id,
          status: filters.status === "all" ? undefined : filters.status,
          difficulty:
            filters.difficulty === "all" ? undefined : filters.difficulty,
          experience:
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

  if (!isLoaded) {
    // Handle loading state
    return <div>Loading...</div>;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Mock Interviews</h1>
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
        {interviews === undefined && <p>Loading...</p>}
        {filteredInterviews && filteredInterviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInterviews.map((interview) => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                user={{
                  companyLogo: user?.companyLogo,
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
