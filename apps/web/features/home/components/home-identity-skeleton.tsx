import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface HomeIdentitySkeletonProps {
  className?: string;
}

export function HomeIdentitySkeleton({ className }: HomeIdentitySkeletonProps) {
  return (
    <header
      className={cn("app-home-masthead-block app-skeleton-block", className)}
      aria-busy="true"
      aria-label="Loading workspace"
    >
      <div className="app-home-masthead">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="app-skeleton h-4 w-24" />
            <Skeleton className="app-skeleton h-7 w-7 rounded-full" />
          </div>
          <Skeleton className="app-skeleton h-8 w-full max-w-sm" />
          <Skeleton className="app-skeleton h-4 w-full max-w-md" />
          <Skeleton className="app-skeleton h-4 w-52 max-w-full" />
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[12rem]">
          <Skeleton className="app-skeleton h-9 w-full rounded-md" />
          <Skeleton className="app-skeleton h-4 w-28 self-center sm:self-end" />
        </div>
      </div>

      <div className="app-home-quota-strip">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="app-skeleton h-6 w-24 rounded-full" />
          <Skeleton className="app-skeleton h-4 w-28" />
        </div>
      </div>
    </header>
  );
}
