import { Skeleton } from "@/components/ui/skeleton";

export function WorkspaceSkeleton() {
  return (
    <div className="flex h-[100dvh] max-h-[100dvh] min-h-0 flex-1 flex-col overflow-hidden bg-[color:var(--page-surface)]" aria-busy="true" aria-label="Loading workspace">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 border-b border-[color:var(--page-line)] bg-white px-4 py-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <Skeleton className="h-5 w-48" />
        <div className="ml-auto flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Sidebar skeleton */}
        <div className="hidden w-[360px] shrink-0 border-r border-[color:var(--page-line)] bg-white xl:block 2xl:w-[400px]">
          <div className="flex h-full flex-col">
            <div className="border-b border-[color:var(--page-line)] px-5 py-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-1.5 h-3.5 w-48" />
            </div>
            <div className="flex-1 space-y-1 px-3 py-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-[10px] px-2 py-3">
                  <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
                  <Skeleton className="h-4 w-4 shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-4 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview skeleton */}
        <section className="flex min-h-0 flex-1 overflow-hidden bg-[color:var(--page-bg-strong)]">
          <div className="flex h-full flex-1 items-center justify-center p-8">
            <div className="w-full max-w-[600px] space-y-4">
              <Skeleton className="mx-auto h-8 w-48" />
              <Skeleton className="mx-auto h-4 w-64" />
              <div className="mt-8 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="mt-6 space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
