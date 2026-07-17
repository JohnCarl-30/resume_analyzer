import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface HomeIdentitySkeletonProps {
  className?: string;
}

export function HomeIdentitySkeleton({ className }: HomeIdentitySkeletonProps) {
  return (
    <aside
      className={cn("app-workbench-aside app-skeleton-block", className)}
      aria-busy="true"
      aria-label="Loading workspace"
    >
      <div className="flex min-w-0 items-start gap-3">
        <Skeleton className="app-skeleton size-11 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="app-skeleton h-5 w-36 max-w-full" />
          <Skeleton className="app-skeleton h-4 w-44 max-w-full" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="app-skeleton h-6 w-24 rounded-full" />
          <Skeleton className="app-skeleton h-4 w-16" />
        </div>
        <Skeleton className="app-skeleton h-2 w-full" />
        <Skeleton className="app-skeleton h-4 w-full" />
        <Skeleton className="app-skeleton h-4 w-4/5" />
      </div>

      <div className="flex flex-col gap-2">
        <Skeleton className="app-skeleton h-9 w-full rounded-md" />
        <Skeleton className="app-skeleton h-9 w-full rounded-md" />
        <Skeleton className="app-skeleton h-8 w-full rounded-md" />
      </div>
    </aside>
  );
}
