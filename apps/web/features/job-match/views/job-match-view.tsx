import { ScoreCard } from "../components/score-card";
import { useJobMatch } from "../view-models/use-job-match";

export function JobMatchView() {
  const { heading, snapshot } = useJobMatch();

  return (
    <section className="flex h-full flex-col px-5 py-6 sm:px-8 sm:py-8">
      <div className="space-y-3 border-b border-[color:var(--app-line)] pb-8">
        <p className="utility-label text-[color:var(--app-accent)]">Role fit</p>
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">{heading}</h2>
        <p className="text-sm leading-6 text-[color:var(--app-muted)] sm:text-base">
          Current target role: {snapshot.role}
        </p>
      </div>

      <div className="pt-8">
        <ScoreCard score={snapshot.fitScore} />

        <div className="grid gap-8 pt-8 sm:grid-cols-2">
          <div className="space-y-4">
            <p className="utility-label text-white/50">Matched skills</p>
            <div className="space-y-3">
              {snapshot.matchedSkills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center justify-between border-b border-[color:var(--app-line)] pb-3 text-sm"
                >
                  <span className="flex items-center gap-3 text-[color:var(--app-text)]">
                    <span className="h-2 w-2 rounded-full bg-[color:var(--app-accent)]" />
                    {skill}
                  </span>
                  <span className="utility-label text-[color:var(--app-accent)]">Present</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="utility-label text-white/50">Gaps to close</p>
            <div className="space-y-3">
              {snapshot.missingSkills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center justify-between border-b border-[color:var(--app-line)] pb-3 text-sm"
                >
                  <span className="flex items-center gap-3 text-[color:var(--app-text)]">
                    <span className="h-2 w-2 rounded-full border border-white/35 bg-transparent" />
                    {skill}
                  </span>
                  <span className="utility-label text-white/50">Missing</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
