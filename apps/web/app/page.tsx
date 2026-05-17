import Link from "next/link";
import { PlusIcon, SparklesIcon, BriefcaseOutlineIcon } from "@/features/onboarding/components/wizard-icons";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[color:var(--page-bg)] px-6">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-soft)] px-4 py-1.5 text-sm font-semibold text-[color:var(--brand)]">
          <SparklesIcon />
          AI-Powered Resume Tools
        </div>
        <h1 className="font-display text-5xl font-bold tracking-tight text-[color:var(--page-text)] sm:text-6xl">
          Land your <span className="text-[color:var(--brand)]">next role</span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg text-[color:var(--page-muted)]">
          Choose how you want to get started. Create a resume from scratch or analyze an existing one against a job description.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <Link
            href="/create-resume"
            className="group relative flex flex-col items-center gap-4 rounded-[24px] border border-[color:var(--page-line)] bg-white p-8 text-center shadow-[0_12px_28px_rgba(59,75,138,0.07)] transition hover:-translate-y-1 hover:border-[color:var(--brand)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.12)]"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--brand-soft)] text-[color:var(--brand)] transition group-hover:scale-110">
              <PlusIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[color:var(--page-text)]">Create Resume</h2>
              <p className="mt-2 text-sm text-[color:var(--page-muted)]">
                Build a new resume from scratch with AI guidance and templates.
              </p>
            </div>
          </Link>

          <Link
            href="/analyses"
            className="group relative flex flex-col items-center gap-4 rounded-[24px] border border-[color:var(--page-line)] bg-white p-8 text-center shadow-[0_12px_28px_rgba(59,75,138,0.07)] transition hover:-translate-y-1 hover:border-[color:var(--brand)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.12)]"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[color:var(--brand-soft)] text-[color:var(--brand)] transition group-hover:scale-110">
              <BriefcaseOutlineIcon />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[color:var(--page-text)]">Analyze Resume</h2>
              <p className="mt-2 text-sm text-[color:var(--page-muted)]">
                Upload your resume and compare it against a job description.
              </p>
            </div>
          </Link>
        </div>

        <div className="mt-16 border-t border-[color:var(--page-line)] pt-10">
          <div className="grid gap-6 sm:grid-cols-3 text-left">
            {[
              { title: "4 Templates", desc: "Harvard, Modern, Ruby & Minimalist layouts" },
              { title: "AI Extraction", desc: "Upload PDF/DOCX and get structured data instantly" },
              { title: "Match Score", desc: "See how well your resume fits the job description" },
              { title: "Bullet Enhancer", desc: "Improve experience bullets with one click" },
              { title: "Auto-Save", desc: "Never lose progress with localStorage backup" },
              { title: "PDF Export", desc: "Print-ready output in any template" },
            ].map((feature) => (
              <div key={feature.title} className="rounded-[16px] border border-[color:var(--page-line)] bg-white p-5 transition hover:border-[color:var(--brand)] hover:shadow-md">
                <h3 className="font-semibold text-[color:var(--page-text)]">{feature.title}</h3>
                <p className="mt-1 text-sm text-[color:var(--page-muted)]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
