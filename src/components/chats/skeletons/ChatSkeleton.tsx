import React from "react";

export function ChatSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border animate-pulse">
      <div className="flex items-center space-x-4">
        {/* Avatar Skeleton */}
        <div className="relative">
          <div className="h-10 w-10 rounded-full bg-muted" />
          <span className="absolute -bottom-1 -right-1 block h-3 w-3 rounded-full ring-2 ring-card bg-gray-400" />
        </div>

        {/* Username and Message Skeleton */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-4 w-12 bg-muted rounded" />
          </div>
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
      </div>

      {/* Time Skeleton */}
      <div className="h-3 w-10 bg-muted rounded" />
    </div>
  );
}
