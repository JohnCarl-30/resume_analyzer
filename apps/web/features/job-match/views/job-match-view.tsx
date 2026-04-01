import { ScoreCard } from "../components/score-card";
import { useJobMatch } from "../view-models/use-job-match";

export function JobMatchView() {
  const { heading, snapshot } = useJobMatch();

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-300">Job Match</p>
        <h2 className="text-2xl font-semibold tracking-tight">{heading}</h2>
        <p className="text-slate-300">Role target: {snapshot.role}</p>
      </div>

      <div className="mt-6 space-y-6">
        <ScoreCard score={snapshot.fitScore} />

        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
          <p className="text-sm font-medium text-slate-200">Matched skills</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {snapshot.matchedSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
          <p className="text-sm font-medium text-slate-200">Gaps to close</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {snapshot.missingSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-sm text-rose-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
