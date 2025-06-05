import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <section className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-8 w-64 bg-muted" />
          <Skeleton className="h-4 w-80 mt-2 bg-muted" />
        </div>
        <Skeleton className="h-10 w-40 rounded-md bg-muted" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-4 w-32 bg-muted" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full bg-muted" />
                <div>
                  <Skeleton className="h-6 w-16 mb-1 bg-muted" />
                  <Skeleton className="h-3 w-24 bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent + Upcoming Interviews */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Interviews Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle>
                <Skeleton className="bg-muted h-8 w-65 rounded-md" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="bg-muted h-5 w-65 rounded-full" />
              </CardDescription>
            </div>
            <Skeleton className="h-8 w-8 rounded-md bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <Skeleton className="h-4 w-40 mb-2 bg-muted" />
                  <Skeleton className="h-3 w-28 bg-muted" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Interviews Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle>
                <Skeleton className="bg-muted h-8 w-65 rounded-md" />
              </CardTitle>
              <CardDescription>
                <Skeleton className="bg-muted h-5 w-65 rounded-full" />
              </CardDescription>
            </div>
            <Skeleton className="h-8 w-8 rounded-md bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <Skeleton className="h-4 w-40 mb-2 bg-muted" />
                    <Skeleton className="h-3 w-28 mb-1 bg-muted" />
                    <Skeleton className="h-3 w-24 bg-muted" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-md bg-muted" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
