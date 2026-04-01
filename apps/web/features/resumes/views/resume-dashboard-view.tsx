import { ResumeStatusBadge } from "../components/resume-status-badge";
import { useResumeDashboard } from "../view-models/use-resume-dashboard";

export function ResumeDashboardView() {
  const { title, description, resumes } = useResumeDashboard();

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl shadow-slate-950/30">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Resume Analyzer</p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        <p className="max-w-2xl text-base text-slate-300 sm:text-lg">{description}</p>
      </div>

      <div className="mt-8 grid gap-4">
        {resumes.map((resume) => (
          <article
            key={resume.id}
            className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-medium text-slate-100">{resume.candidateName}</h2>
                <p className="text-sm text-slate-400">{resume.fileName}</p>
              </div>
              <ResumeStatusBadge status={resume.status} />
            </div>
            <p className="mt-4 text-sm text-slate-500">Uploaded {resume.uploadedAt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
