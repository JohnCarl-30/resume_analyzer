import { sampleJobMatch } from "@/features/job-match/model/job-match";
import { JobMatchView } from "@/features/job-match/views/job-match-view";
import { sampleResumes } from "@/features/resumes/model/resume";
import { ResumeDashboardView } from "@/features/resumes/views/resume-dashboard-view";
import { sampleTemplates } from "@/features/templates/model/template";
import { TemplateSelectionView } from "@/features/templates/views/template-selection-view";

export default function HomePage() {
  const reviewedCount = sampleResumes.filter((resume) => resume.status === "analyzed").length;

  return (
    <main className="relative min-h-screen overflow-hidden text-[color:var(--app-text)]">
      <div
        aria-hidden
        className="ambient-drift pointer-events-none absolute left-[-12rem] top-[-9rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,_rgba(152,229,195,0.22)_0%,_rgba(152,229,195,0)_70%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_18%,transparent_82%,rgba(255,255,255,0.03)_100%)]"
      />

      <div className="relative mx-auto min-h-screen max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-[color:var(--app-bg-soft)] shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          <header className="section-reveal border-b border-[color:var(--app-line)] px-5 py-5 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-3">
                <p className="utility-label text-[color:var(--app-accent)]">Resume intelligence desk</p>
                <div className="space-y-2">
                  <h1 className="font-display text-4xl tracking-tight sm:text-5xl lg:text-6xl">
                    Resume Analyzer
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-[color:var(--app-muted)] sm:text-base">
                    Keep intake status, role fit, and export choices visible from one calm
                    surface while the analysis pipeline comes online.
                  </p>
                </div>
              </div>

              <dl className="grid gap-x-8 gap-y-4 text-sm text-[color:var(--app-muted)] sm:grid-cols-3">
                <div className="space-y-1">
                  <dt className="utility-label text-white/50">Live queue</dt>
                  <dd className="font-mono text-lg text-[color:var(--app-text)]">
                    {sampleResumes.length} resumes
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="utility-label text-white/50">Reviewed</dt>
                  <dd className="font-mono text-lg text-[color:var(--app-text)]">
                    {reviewedCount} ready
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="utility-label text-white/50">Role target</dt>
                  <dd className="text-lg text-[color:var(--app-text)]">{sampleJobMatch.role}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="utility-label text-white/50">Template set</dt>
                  <dd className="font-mono text-lg text-[color:var(--app-text)]">
                    {sampleTemplates.length} layouts
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="utility-label text-white/50">Prototype mode</dt>
                  <dd className="text-lg text-[color:var(--app-text)]">Sample data</dd>
                </div>
                <div className="space-y-1">
                  <dt className="utility-label text-white/50">Fit score</dt>
                  <dd className="font-mono text-lg text-[color:var(--app-text)]">
                    {sampleJobMatch.fitScore}%
                  </dd>
                </div>
              </dl>
            </div>
          </header>

          <div className="grid xl:grid-cols-[minmax(0,1.4fr)_24rem]">
            <div className="section-reveal border-b border-[color:var(--app-line)] xl:border-b-0 xl:border-r xl:border-[color:var(--app-line)]">
              <ResumeDashboardView />
            </div>
            <div className="section-reveal" data-delay="1">
              <JobMatchView />
            </div>
          </div>

          <div className="section-reveal border-t border-[color:var(--app-line)]" data-delay="2">
            <TemplateSelectionView />
          </div>
        </div>
      </div>
    </main>
  );
}
