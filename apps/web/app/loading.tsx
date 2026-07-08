export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="h-2 w-24 rounded-full bg-primary" />
        <div className="flex flex-col gap-2">
          <div className="h-8 w-52 rounded-lg bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-4/5 rounded bg-muted" />
        </div>
        <p className="text-sm text-muted-foreground">Loading your resume workspace...</p>
      </div>
    </main>
  );
}
