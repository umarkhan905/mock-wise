import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Box, Check, Crown, Zap } from "lucide-react";

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
    id: "basic",
    name: "Basic",
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
  currenPlan: "free" | "standard" | "pro";
}

export function AvailablePlans({ currenPlan }: Props) {
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
              className={`relative ${currenPlan === plan.id ? "ring-2 ring-primary" : ""} ${plan.popular ? "border-primary" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white">Most Popular</Badge>
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
                  className="w-full"
                  variant={currenPlan === plan.id ? "secondary" : "default"}
                  disabled={currenPlan === plan.id}
                >
                  {currenPlan === plan.id
                    ? "Current Plan"
                    : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
