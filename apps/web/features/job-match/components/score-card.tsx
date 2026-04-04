export function ScoreCard({ score }: { score: number }) {
  return (
    <div className="border-b border-[color:var(--app-line)] pb-8">
      <p className="utility-label text-white/50">Fit score</p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="font-display text-[4.75rem] leading-none tracking-tight text-[color:var(--app-text)] sm:text-[5.75rem]">
          {score}
          <span className="ml-1 text-3xl text-[color:var(--app-accent)]">%</span>
        </p>
        <p className="max-w-[15rem] text-sm leading-6 text-[color:var(--app-muted)]">
          Strong backend and AI language alignment with a few platform gaps still worth closing.
        </p>
      </div>
    </div>
  );
}
