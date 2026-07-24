export function AuthFormFallback({ label }: { label: string }) {
  return (
    <div className="space-y-5" aria-busy="true" aria-live="polite">
      <div className="space-y-2">
        <div className="h-7 w-48 max-w-full rounded bg-muted" />
        <div className="h-4 w-64 max-w-full rounded bg-muted" />
      </div>
      <div className="app-auth-card space-y-4 px-5 py-6 sm:px-6">
        <div className="h-11 w-full rounded-md bg-muted" />
        <div className="h-11 w-full rounded-md bg-muted" />
        <div className="h-11 w-full rounded-md bg-muted" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
