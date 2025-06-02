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
import {
  Package,
  Star,
  Rocket,
  Diamond,
  Loader2,
  LucideIcon,
} from "lucide-react";
import { useAction, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

const iconMap = [
  {
    name: "Package",
    icon: Package,
  },
  {
    name: "Star",
    icon: Star,
  },
  {
    name: "Rocket",
    icon: Rocket,
  },
  {
    name: "Diamond",
    icon: Diamond,
  },
];

export function InterviewPacks() {
  const [loading, setLoading] = useState<Id<"interviewPacks"> | null>(null);
  const createCheckoutSession = useAction(
    api.stripe.createInterviewPackCheckoutSession
  );
  const packs = useQuery(api.interviewPacks.getPacks);

  const router = useRouter();

  const handleCheckout = async (packId: Id<"interviewPacks">) => {
    setLoading(packId);
    try {
      const { checkoutURL } = await createCheckoutSession({ packId });
      if (checkoutURL) {
        router.push(checkoutURL);
      }
    } catch (error) {
      console.log("Something went wrong creating checkout session", error);
      toast.error("Something went wrong creating checkout session");
    } finally {
      setLoading(null);
    }
  };

  // loading state
  if (packs === undefined) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Interview Packs</h2>
        <p className="text-muted-foreground">
          Need more interviews? Purchase additional interview packs to boost
          your limit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {packs.map((pack) => {
          const IconComponent = iconMap.find((item) => item.name === pack.icon)
            ?.icon as LucideIcon;

          const discountedPrice = pack.isDiscounted
            ? pack.price - (pack.price * pack.discountPercent) / 100
            : pack.price;

          return (
            <Card
              key={pack._id}
              className={`relative ${pack.popular ? "ring-2 ring-primary border-primary" : ""}`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white">Best Value</Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-2">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{pack.name}</CardTitle>
                <CardDescription className="text-xs">
                  {pack.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    ${discountedPrice.toFixed(2)}
                  </div>

                  {pack.isDiscounted && (
                    <>
                      <div className="text-xs text-muted-foreground line-through">
                        ${pack.price.toFixed(2)}
                      </div>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Save {pack.discountPercent}%
                      </Badge>
                    </>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-lg font-semibold">
                    {pack.interviewCredits}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    interviews
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${(discountedPrice / pack.interviewCredits).toFixed(2)} per
                    interview
                  </div>
                </div>

                <Button
                  className="w-full text-white"
                  size="sm"
                  onClick={() => handleCheckout(pack._id)}
                  disabled={loading === pack._id}
                >
                  {loading === pack._id ? (
                    <Loader2 className="animate-spin size-4" />
                  ) : (
                    "Purchase Pack"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-semibold mb-2">Need a custom solution?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Contact our sales team for enterprise pricing and custom interview
              volumes.
            </p>
            <Button variant="outline" asChild>
              <Link
                href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}?subject=${encodeURIComponent(
                  "Enterprise Interview Pack Inquiry"
                )}`}
              >
                Contact Sales
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
