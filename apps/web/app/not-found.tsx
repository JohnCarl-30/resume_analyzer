import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="flex w-full max-w-md flex-col gap-5 rounded-lg border bg-background p-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            This resume page may have moved, or the saved check link is not available.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/create-resume">Create Resume</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/analyses">Saved Checks</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
