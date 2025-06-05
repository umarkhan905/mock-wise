import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function InterviewLoader() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="gap-2">
          <CardHeader className="px-3 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 bg-muted" />
                <Skeleton className="h-3 w-1/2 bg-muted" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-3 space-y-3">
            <Skeleton className="h-3 w-full bg-muted" />
            <Skeleton className="h-3 w-11/12 bg-muted" />
            <Skeleton className="h-3 w-2/3 bg-muted" />

            <Skeleton className="h-10 w-full mt-2 bg-muted" />
            <Skeleton className="h-10 w-full mt-2 bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
