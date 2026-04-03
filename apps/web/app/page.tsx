import { JobMatchView } from "@/features/job-match/views/job-match-view";
import { ResumeDashboardView } from "@/features/resumes/views/resume-dashboard-view";
import { TemplateSelectionView } from "@/features/templates/views/template-selection-view";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-50">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.95fr]">
          <ResumeDashboardView />
          <JobMatchView />
        </div>
        <TemplateSelectionView />
      </div>
    </main>
  );
}
