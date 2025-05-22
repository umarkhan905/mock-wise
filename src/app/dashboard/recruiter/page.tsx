"use client";

import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, BarChart, Calendar, Plus, Users } from "lucide-react";
import { ConvexError } from "convex/values";
import { useRouter } from "next/navigation";
import { StatsCard } from "@/components/dashboard/stats/StatsCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Dashboard() {
  const stats = useQuery(api.recruiter.getRecruiterStats);
  const router = useRouter();

  // redirect to login if user is not signed in
  if (stats instanceof ConvexError && stats.message.includes("unauthorized"))
    return router.push("/");

  if (stats === undefined) return <div>Loading...</div>;

  return (
    <section className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {stats.user.username}</h1>
          <p className="text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your interviews
          </p>
        </div>
        <Button asChild className="min-h-10 text-white">
          <Link href="/dashboard/recruiter/create-interview">
            <Plus className="mr-2 size-5" /> Create Interview
          </Link>
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Total Interviews"
          icon={BarChart}
          value={stats.total}
          subValue={`+${stats.monthly} this month`}
        />

        <StatsCard
          title="Scheduled Interviews"
          icon={Calendar}
          value={stats.scheduled}
          subValue="Next 7 days"
        />

        <StatsCard
          title=" Candidates Evaluated"
          icon={Users}
          value={stats.evaluated}
          subValue="This month"
        />
      </div>

      {/* Recent Mock Interviews */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Interviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Recent Interviews</CardTitle>
              <CardDescription>
                Your recently created interview sessions
              </CardDescription>
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href="/dashboard/recruiter/interviews">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {stats.recent &&
                stats.recent.length > 0 &&
                stats.recent.map((interview) => (
                  <Link
                    href={`/interview/${interview._id}/recruiter/details`}
                    key={interview._id}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0 hover:bg-muted/50 px-2 cursor-pointer"
                  >
                    <div>
                      <div className="font-medium">{interview.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(interview._creationTime).toLocaleDateString()}{" "}
                        •<span className="capitalize ml-1">5 Candidates</span>
                      </div>
                    </div>
                  </Link>
                ))}

              {stats.recent.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No recent interviews found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Upcoming Interviews</CardTitle>
              <CardDescription>
                Scheduled interviews for the next 7 days
              </CardDescription>
            </div>
            <Link href="/recruiter/calendar">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.scheduledInterviews.map((interview) => (
                <div
                  key={interview._id}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">{interview.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(
                        interview.scheduledAt as number
                      ).toLocaleDateString()}{" "}
                      •{" "}
                      {new Date(
                        interview.scheduledAt as number
                      ).toLocaleTimeString()}
                    </div>
                    <div className="text-sm">
                      {interview.role
                        ? `at ${stats.user.companyName}`
                        : "Mock Interview"}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/interview/${interview._id}/recruiter/details`}
                    >
                      Details
                    </Link>
                  </Button>
                </div>
              ))}

              {stats.scheduledInterviews.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No upcoming interviews scheduled
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
