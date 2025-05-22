import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import React from "react";

interface Props {
  title: string;
  icon: LucideIcon;
  value: number;
  subValue?: string;
}

export function StatsCard({ title, icon: Icon, value, subValue }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Icon className="size-8 text-primary" />
          <div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subValue}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
