import React from "react";

export function UserCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border animate-pulse">
      <div className="flex items-center space-x-4">
        {/* Avatar Skeleton */}
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-muted" />
        </div>

        {/* Text Skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-28 bg-muted rounded" />
          <div className="flex items-center space-x-2">
            <div className="h-3 w-16 bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
        </div>
      </div>

      {/* Button Skeleton */}
      <div className="h-9 w-[120px] bg-muted rounded-md" />
    </div>
  );
}
