import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { UserCardSkeleton } from "@/components/chats/skeletons/UserCardSkeleton";

export function ScheduleLoader() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between space-x-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48 bg-muted rounded-md" />
            <Skeleton className="h-4 w-64 bg-muted rounded-md" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-32 bg-muted rounded-md" />
            <Skeleton className="h-10 w-full bg-muted rounded-md" />
          </div>

          <div className="flex justify-end">
            <Skeleton className="h-10 w-44 bg-muted rounded-md" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Skeleton className="h-5 w-40 bg-muted rounded-md" />
            <Badge className="py-1 px-4 rounded-full bg-muted text-transparent">
              0 / 0
            </Badge>
          </div>

          {/* Simulate a few candidate cards */}
          {[...Array(2)].map((_, i) => (
            <UserCardSkeleton key={i} />
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <Skeleton className="h-10 w-24 bg-muted rounded-md" />
        <Skeleton className="h-10 w-24 bg-muted rounded-md" />
      </CardFooter>
    </Card>
  );
}
