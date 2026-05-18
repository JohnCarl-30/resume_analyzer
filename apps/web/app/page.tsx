import Link from "next/link";
import { PlusIcon, SparklesIcon, BriefcaseOutlineIcon } from "@/features/onboarding/components/wizard-icons";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-y-auto bg-[color:var(--page-bg)]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-[color:var(--brand-soft)] opacity-60 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16 sm:px-8 sm:py-24 lg:py-32">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-soft)] px-4 py-1.5 text-sm font-semibold text-[color:var(--brand)]">
            <SparklesIcon />
            AI-Powered Resume Tools
          </div>
          <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold tracking-tight text-[color:var(--page-text)] sm:text-6xl lg:text-7xl">
            Land your <span className="text-[color:var(--brand)]">next role</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[color:var(--page-muted)] sm:text-xl">
            Choose how you want to get started. Create a resume from scratch or analyze an existing one against a job description.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl grid gap-6 sm:grid-cols-2 lg:mt-20">
          <Link
            href="/create-resume"
            className="group relative flex flex-col items-center gap-5 rounded-[28px] border border-[color:var(--page-line)] bg-white p-10 text-center shadow-[0_12px_28px_rgba(59,75,138,0.07)] transition hover:-translate-y-2 hover:border-[color:var(--brand)] hover:shadow-[0_24px_48px_rgba(37,99,235,0.14)]"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-[color:var(--brand-soft)] text-[color:var(--brand)] transition group-hover:scale-110">
              <PlusIcon />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[color:var(--page-text)]">Create Resume</h2>
              <p className="mt-3 text-[0.95rem] leading-6 text-[color:var(--page-muted)]">
                Build a new resume from scratch with AI guidance, multiple templates, and real-time preview.
              </p>
            </div>
          </Link>

          <Link
            href="/analyses"
            className="group relative flex flex-col items-center gap-5 rounded-[28px] border border-[color:var(--page-line)] bg-white p-10 text-center shadow-[0_12px_28px_rgba(59,75,138,0.07)] transition hover:-translate-y-2 hover:border-[color:var(--brand)] hover:shadow-[0_24px_48px_rgba(37,99,235,0.14)]"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-[color:var(--brand-soft)] text-[color:var(--brand)] transition group-hover:scale-110">
              <BriefcaseOutlineIcon />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[color:var(--page-text)]">Analyze Resume</h2>
              <p className="mt-3 text-[0.95rem] leading-6 text-[color:var(--page-muted)]">
                Upload your resume and compare it against any job description with AI-powered suggestions.
              </p>
            </div>
          </Link>
        </div>

        <div className="mx-auto mt-24 max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-[color:var(--page-text)]">Everything you need</h2>
            <p className="mt-2 text-[color:var(--page-muted)]">Built for modern job seekers</p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "4 Templates", desc: "Harvard, Modern, Ruby & Minimalist layouts designed for ATS." },
              { title: "AI Extraction", desc: "Upload PDF/DOCX and get structured resume data instantly." },
              { title: "Match Score", desc: "See how well your resume fits the job description." },
              { title: "Bullet Enhancer", desc: "Improve experience bullets with one click using AI." },
              { title: "Auto-Save", desc: "Never lose progress — everything saved to your browser." },
              { title: "PDF Export", desc: "Print-ready output in any template you choose." },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-[20px] border border-[color:var(--page-line)] bg-white p-6 transition hover:border-[color:var(--brand)] hover:shadow-md"
              >
                <h3 className="font-semibold text-[color:var(--page-text)]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--page-muted)]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
