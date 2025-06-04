"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Box, Check, Crown, Loader2, Zap } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isDowngrade } from "@/utils/subscriptions";
import { formatDate } from "date-fns";
import { Subscription } from "@/types";

const plans = [
  {
    id: "free",
    name: "Free",
    icon: Zap,
    price: 0,
    description: "Best option for personal use",
    features: [
      "5 interviews per month",
      "5 AI based questions",
      "10 questions per interview",
      "5 candidates per interview",
      "1 attempt per interview",
    ],
    popular: false,
  },
  {
    id: "standard",
    name: "Standard",
    icon: Box,
    price: 19,
    description: "Best option for small teams",
    features: [
      "10 interviews",
      "10 AI based questions",
      "20 questions per interview",
      "10 candidates per interview",
      "3 attempts per interview",
    ],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    icon: Crown,
    price: 49,
    description: "Best option for large teams",
    features: [
      "25 interviews",
      "15 AI based questions",
      "30 questions per interview",
      "20 candidates per interview",
      "5 attempts per interview",
    ],
    popular: false,
  },
];

interface Props {
  subscription: Subscription;
}

type Plan = "standard" | "pro";

export function AvailablePlans({ subscription }: Props) {
  const [loading, setLoading] = useState<Plan | null>(null);

  // actions
  const createCheckoutSession = useAction(
    api.stripe.createSubscriptionCheckoutSession
  );
  const downgradeSubscription = useAction(
    api.subscriptions.downgradeUserSubscription
  );
  const resubscribeToCurrentPlan = useAction(
    api.subscriptions.resubscribeToCurrentPlan
  );

  // router
  const router = useRouter();

  const handleCheckout = async (plan: Plan) => {
    setLoading(plan);
    try {
      const { checkoutURL } = await createCheckoutSession({ plan });

      if (checkoutURL) {
        router.push(checkoutURL);
      }
    } catch (error) {
      console.log("Error while creating checkout session", error);
      toast.error("Something went wrong creating checkout session");
    } finally {
      setLoading(null);
    }
  };

  const handleDowngrade = async (
    nextPlan: Plan,
    stripeSubscriptionId: string
  ) => {
    setLoading(nextPlan);
    try {
      await downgradeSubscription({
        nextPlan,
        stripeSubscriptionId,
      });
      toast.success(
        `Successfully subscribed to ${nextPlan} plan. You will be migrate to ${nextPlan} plan after the current billing period ends.`
      );
    } catch (error) {
      console.log("Error while downgrading subscription", error);
      toast.error("Something went wrong downgrading subscription");
    } finally {
      setLoading(null);
    }
  };

  const handleResubscribe = async (
    stripeSubscriptionId: string,
    plan: Plan
  ) => {
    setLoading(plan);
    try {
      await resubscribeToCurrentPlan({
        stripeSubscriptionId,
      });
      toast.success(`Successfully re-subscribed to ${plan} plan.`);
    } catch (error) {
      console.log("Error while downgrading subscription", error);
      toast.error("Something went wrong downgrading subscription");
    } finally {
      setLoading(null);
    }
  };

  const handlePlanClick = async (plan: Plan) => {
    if (!subscription) return;

    if (
      subscription.plan === plan &&
      subscription.nextPlan &&
      subscription.cancelAtPeriodEnd
    ) {
      // handle resubscribe
      await handleResubscribe(subscription.stripeSubscriptionId!, plan);
      return;
    }

    if (isDowngrade(subscription.plan, plan)) {
      // handle downgrade case
      await handleDowngrade(plan, subscription.stripeSubscriptionId!);

      return;
    } else {
      // handle checkout for new plan
      await handleCheckout(plan);
      return;
    }
  };

  if (subscription === undefined) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Available Plans</h2>
        <p className="text-muted-foreground">
          Choose the plan that best fits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          return (
            <Card
              key={plan.id}
              className={`relative ${subscription.plan === plan.id ? "ring-2 ring-primary" : ""} ${plan.popular ? "border-primary" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white">Most Popular</Badge>
                </div>
              )}

              {(subscription.plan === plan.id ||
                subscription.nextPlan === plan.id) && (
                <div className="absolute top-3 right-3">
                  <Badge
                    className={`rounded-full ${subscription.nextPlan === plan.id ? "bg-secondary" : "bg-primary/20 text-primary"}`}
                    variant={"outline"}
                  >
                    {subscription.plan === plan.id ? "Active" : "Upcoming"}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="mx-auto mb-2">
                  <IconComponent className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-3xl font-bold">
                  ${plan.price}
                  <span className="text-sm font-normal text-muted-foreground">
                    /month
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full text-white"
                  variant={
                    subscription.plan === plan.id ? "secondary" : "default"
                  }
                  disabled={
                    (subscription.plan === plan.id &&
                      !subscription.cancelAtPeriodEnd) ||
                    loading === plan.id ||
                    subscription.nextPlan === plan.id
                  }
                  onClick={() => handlePlanClick(plan.id as Plan)}
                >
                  {loading === plan.id ? (
                    <>
                      <Loader2 className="animate-spin size-5" />
                      <span>Processing...</span>
                    </>
                  ) : subscription.plan === plan.id ? (
                    subscription.nextPlan && subscription.cancelAtPeriodEnd ? (
                      "Resubscribe Plan"
                    ) : (
                      "Current Plan"
                    )
                  ) : subscription.nextPlan === plan.id ? (
                    `Plan Starts on ${formatDate(new Date(subscription.currentPeriodEnd * 1000), "MMM dd, yyyy")}`
                  ) : isDowngrade(subscription.plan, plan.id as Plan) ? (
                    `Switch to ${plan.name} Plan`
                  ) : (
                    `Upgrade to ${plan.name} Plan`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
