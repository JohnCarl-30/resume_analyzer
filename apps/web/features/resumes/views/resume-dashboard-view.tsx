import { ResumeStatusBadge } from "../components/resume-status-badge";
import { useResumeDashboard } from "../view-models/use-resume-dashboard";

const uploadDateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "UTC",
});

export function ResumeDashboardView() {
  const { title, description, resumes } = useResumeDashboard();
  const analyzedCount = resumes.filter((resume) => resume.status === "analyzed").length;
  const inFlightCount = resumes.filter((resume) => resume.status === "processing").length;

  const stats = [
    { label: "Queued resumes", value: resumes.length.toString().padStart(2, "0") },
    { label: "Analyzed", value: analyzedCount.toString().padStart(2, "0") },
    { label: "In flight", value: inFlightCount.toString().padStart(2, "0") },
  ];

  return (
    <section className="px-5 py-6 sm:px-8 sm:py-8">
      <div className="border-b border-[color:var(--app-line)] pb-8">
        <div className="space-y-3">
          <p className="utility-label text-[color:var(--app-accent)]">Active intake</p>
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl lg:max-w-3xl">
            {title}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-[color:var(--app-muted)] sm:text-base">
            {description}
          </p>
        </div>

        <dl className="mt-8 grid gap-5 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="border-t border-[color:var(--app-line)] pt-4">
              <dt className="utility-label text-white/50">{stat.label}</dt>
              <dd className="mt-3 font-mono text-3xl text-[color:var(--app-text)] sm:text-4xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="pt-6">
        <div className="hidden border-b border-[color:var(--app-line)] pb-3 text-xs uppercase tracking-[0.24em] text-white/40 sm:grid sm:grid-cols-[minmax(0,1fr)_8.5rem_8.5rem]">
          <span>Candidate</span>
          <span className="text-right">Status</span>
          <span className="text-right">Uploaded</span>
        </div>

        <div>
          {resumes.map((resume) => (
            <article
              key={resume.id}
              className="group grid gap-3 border-b border-[color:var(--app-line)] py-4 transition duration-300 hover:bg-white/[0.03] sm:grid-cols-[minmax(0,1fr)_8.5rem_8.5rem] sm:items-center sm:px-3"
            >
              <div>
                <h3 className="text-lg font-medium text-[color:var(--app-text)] transition duration-300 group-hover:text-[color:var(--app-accent)]">
                  {resume.candidateName}
                </h3>
                <p className="mt-1 text-sm text-[color:var(--app-muted)]">{resume.fileName}</p>
              </div>

              <div className="sm:justify-self-end">
                <ResumeStatusBadge status={resume.status} />
              </div>

              <p className="text-sm text-[color:var(--app-muted)] sm:text-right">
                {uploadDateFormatter.format(new Date(resume.uploadedAt))}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
