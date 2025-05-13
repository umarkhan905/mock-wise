import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import React from "react";

interface SpinnerProps {
  message?: string;
  className?: string;
  loaderClassName?: string;
  textClassName?: string;
}

export default function Spinner({
  message,
  className,
  loaderClassName,
  textClassName,
}: SpinnerProps) {
  if (!message) return null;
  return (
    <Card className={`bg-card/90 backdrop-blur-sm border ${className}`}>
      <CardContent className="flex items-center flex-col gap-2">
        <Loader2 className={`animate-spin size-6 ${loaderClassName}`} />
        <span className={`font-semibold text-sm ${textClassName}`}>
          {message}
        </span>
      </CardContent>
    </Card>
  );
}
