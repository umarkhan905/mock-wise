"use client";

import { useAuthContext } from "@/context/AuthStore";
import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../../../convex/_generated/api";
import { CurrentPlanUsage } from "@/components/billing/CurrentPlanUsage";
import { UsageChart } from "@/components/billing/UsageChart";
import { AvailablePlans } from "@/components/billing/AvailablePlans";
import { InterviewPacks } from "@/components/billing/InterviewPacks";

export default function Billing() {
  const { user } = useAuthContext();
  const planUsage = useQuery(
    api.usage.getUserUsage,
    user ? { userId: user._id } : "skip"
  );

  if (planUsage === undefined) {
    // handle loading
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscriptions</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription plan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Plan Usage */}
        <CurrentPlanUsage planUsage={planUsage} />

        {/* Usage Chart */}
        <UsageChart />
      </div>

      {/* Available Plans */}
      <AvailablePlans currenPlan={planUsage?.plan || "free"} />

      {/* Interview Packs */}
      <InterviewPacks />
    </div>
  );
}
