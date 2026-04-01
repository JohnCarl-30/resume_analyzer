export function ScoreCard({ score }: { score: number }) {
  return (
    <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-5 text-cyan-100">
      <p className="text-sm uppercase tracking-[0.25em] text-cyan-300">Fit Score</p>
      <p className="mt-3 text-5xl font-semibold tracking-tight">{score}%</p>
    </div>
  );
}
