"use client";

import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  BarChart,
  Calendar,
  Clock,
  Plus,
  Star,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/context/AuthStore";
import { DashboardSkeleton } from "./_components/skeletons/DashboardSkeleton";

export default function Dashboard() {
  const { user } = useAuthContext();
  const stats = useQuery(api.candidates.getCandidateStats);
  const router = useRouter();
  const upcomingInterviews = useQuery(
    api.candidates.getUpcomingInterviews,
    user
      ? {
          userId: user._id,
        }
      : "skip"
  );

  // redirect to login if user is not signed in
  if (stats instanceof ConvexError && stats.message.includes("unauthorized"))
    return router.push("/");

  if (stats === undefined || upcomingInterviews === undefined)
    return <DashboardSkeleton />;

  const recentInterviews = stats?.recent || [];

  return (
    <section className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {stats.user.username}</h1>
          <p className="text-muted-foreground mt-1">
            Prepare for your next interview
          </p>
        </div>
        <Button asChild className="min-h-10 text-white">
          <Link href="/dashboard/candidate/create-interview">
            <Plus className="mr-2 size-5" /> Create Mock Interview
          </Link>
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard
          title="Total Interviews"
          icon={BarChart}
          value={stats.total}
          subValue={`${stats.mock} mock, ${stats.job} job interviews`}
        />

        <StatsCard
          title="Upcoming Interviews"
          icon={Calendar}
          value={2}
          subValue="Next 14 days"
        />

        <StatsCard
          title="Practice Time"
          icon={Clock}
          value={6.5}
          subValue="6.5 hours"
        />
      </div>

      {/* Recent Mock Interviews */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Interviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Recent Mock Interviews</CardTitle>
              <CardDescription>
                Your most recent interview sessions
              </CardDescription>
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href="/dashboard/candidate/mock-interviews">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {recentInterviews &&
                recentInterviews.length > 0 &&
                recentInterviews.map((interview) => (
                  <Link
                    href={`/interview/${interview._id}/candidate/details`}
                    key={interview._id}
                    className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0 hover:bg-muted/50 px-2 cursor-pointer"
                  >
                    <div>
                      <div className="font-medium">{interview.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(interview._creationTime).toLocaleDateString()}{" "}
                        •<span className="capitalize ml-1">Mock Interview</span>
                      </div>
                    </div>
                    {interview.rating ? (
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>{interview.rating}/10</span>
                      </div>
                    ) : (
                      <Badge
                        variant="outline"
                        className="rounded-full bg-primary/20 text-primary"
                      >
                        Not started yet
                      </Badge>
                    )}
                  </Link>
                ))}

              {recentInterviews.length === 0 && (
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
              <CardDescription>Your scheduled interviews</CardDescription>
            </div>
            <Link href="/candidate/calendar">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingInterviews.map((interview) => (
                <div
                  key={interview._id}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">{interview.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(interview.scheduledAt!).toLocaleDateString()} •{" "}
                      {new Date(interview.scheduledAt!).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    {/* TODO: Add company name */}
                    <div className="text-sm">at Google</div>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/interview/${interview._id}/candidate/details`}
                    >
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}

              {upcomingInterviews.length === 0 && (
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
