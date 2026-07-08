"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App route error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="flex w-full max-w-md flex-col gap-5 rounded-lg border bg-background p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            The page could not finish loading. Your local draft data is still stored in this browser when autosave is on.
          </p>
        </div>
        <Button type="button" onClick={reset} className="w-fit">
          Try again
        </Button>
      </section>
    </main>
  );
}
