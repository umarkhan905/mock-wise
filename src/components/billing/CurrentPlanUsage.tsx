import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, Users, CheckCircle, Bot, List } from "lucide-react";
import { PlanUsage } from "@/types";
import { PLAN_LIMITS } from "@/utils/plans-limits";

interface Props {
  planUsage: PlanUsage | null;
}

export function CurrentPlanUsage({ planUsage }: Props) {
  if (!planUsage) return null;

  const plan = PLAN_LIMITS[planUsage.plan];
  const usagePercentage = (planUsage.interviews.used / plan.interviews) * 100;

  const date = new Date(planUsage.period);
  date.setMonth(date.getMonth() + 1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <span className="capitalize">{planUsage.plan} Plan</span>
            </CardTitle>
            <CardDescription>${plan.pricing}/monthly • Active</CardDescription>
          </div>
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-800 rounded-full hover:bg-gray-800 hover:text-green-500 cursor-default transition-all duration-300"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Interview Usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Interviews this month</span>
            </span>
            <span className="font-medium">
              {planUsage.interviews.used} / {plan.interviews}
            </span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {plan.interviews - planUsage.interviews.used} interviews remaining
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center space-x-1">
              <Bot className="h-4 w-4" />
              <span>AI based questions per interview</span>
            </span>
            <span className="font-medium">{planUsage.aiBasedQuestions}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center space-x-1">
              <List className="h-4 w-4" />
              <span>Questions per interview</span>
            </span>
            <span className="font-medium">
              {planUsage.questionsPerInterview}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>Candidates per interview</span>
            </span>
            <span className="font-medium">
              {planUsage.candidatesPerInterview}
            </span>
          </div>
        </div>

        {/* Next Billing */}
        <div className="pt-4 border-t">
          <div>
            <p className="text-sm font-medium">
              {planUsage.plan === "free"
                ? "Plan will renew on"
                : "Next billing date"}
            </p>
            <p className="text-xs text-muted-foreground">
              {date.toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
