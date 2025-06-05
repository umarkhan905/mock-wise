import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const BillingPageLoader = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-72 bg-muted" />
        <Skeleton className="h-4 w-60 mt-2 bg-muted" />
      </div>

      {/* Usage + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-5 w-36 mb-2 bg-muted" />
                <Skeleton className="h-4 w-28 bg-muted" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full bg-muted" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-2 w-full bg-muted" />
            <Skeleton className="h-4 w-40 bg-muted" />

            <Skeleton className="h-4 w-full bg-muted" />
            <Skeleton className="h-4 w-52 bg-muted" />
            <Skeleton className="h-4 w-40 bg-muted" />
            <Skeleton className="h-4 w-64 bg-muted" />
            <Skeleton className="h-4 w-48 bg-muted" />

            <Skeleton className="h-4 w-40 bg-muted" />
            <Skeleton className="h-3 w-32 bg-muted" />
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <Skeleton className="h-5 w-24 mb-1 bg-muted" />
            <Skeleton className="h-4 w-32 bg-muted" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-40 w-full bg-muted" />
          </CardContent>
        </Card>
      </div>

      {/* Available Plans */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48 bg-muted" />
        <Skeleton className="h-4 w-72 bg-muted" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 space-y-4">
              <Skeleton className="h-6 w-6 mx-auto bg-muted" />
              <Skeleton className="h-4 w-28 mx-auto bg-muted" />
              <Skeleton className="h-3 w-40 mx-auto bg-muted" />
              <Skeleton className="h-6 w-24 mx-auto bg-muted" />
              <Skeleton className="h-4 w-full bg-muted" />
              <Skeleton className="h-10 w-full rounded-md bg-muted" />
            </Card>
          ))}
        </div>
      </div>

      {/* Interview Packs */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48 bg-muted" />
        <Skeleton className="h-4 w-80 bg-muted" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 space-y-4">
              <Skeleton className="h-5 w-5 mx-auto bg-muted" />
              <Skeleton className="h-4 w-24 mx-auto bg-muted" />
              <Skeleton className="h-3 w-36 mx-auto bg-muted" />
              <Skeleton className="h-6 w-20 mx-auto bg-muted" />
              <Skeleton className="h-3 w-24 mx-auto bg-muted" />
              <Skeleton className="h-8 w-full rounded-md bg-muted" />
            </Card>
          ))}
        </div>

        <Card className="bg-muted/50">
          <CardContent className="pt-6 space-y-2">
            <Skeleton className="h-5 w-48 mx-auto bg-muted" />
            <Skeleton className="h-3 w-80 mx-auto bg-muted" />
            <Skeleton className="h-8 w-40 mx-auto rounded-md bg-muted" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
