import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";

const chartData = [
  { month: "Jan", interviews: 12 },
  { month: "Feb", interviews: 15 },
  { month: "Mar", interviews: 18 },
  { month: "Apr", interviews: 22 },
  { month: "May", interviews: 25 },
  { month: "Jun", interviews: 18 },
];

const chartConfig = {
  interviews: {
    label: "Interviews",
    color: "hsl(var(--primary))",
  },
};

export function UsageChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Usage Analytics</span>
        </CardTitle>
        <CardDescription>
          Your interview usage over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <YAxis tickLine={false} axisLine={false} className="text-xs" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="interviews"
              stroke="var(--color-interviews)"
              fill="var(--color-interviews)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Average: 18 interviews per month
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
