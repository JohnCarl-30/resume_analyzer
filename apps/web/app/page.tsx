import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, FileText, SearchCheck, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeRenderer } from "@/features/editor/components/resume-renderer";
import { defaultResumeForm } from "@/features/editor/model/resume-form";
import { BrandMark } from "@/features/onboarding/components/wizard-icons";

export const metadata: Metadata = {
  title: "Resume Builder and Job Match Checker",
  description:
    "Create a clean resume or check an existing resume against a job description with plain-language guidance.",
  alternates: {
    canonical: "/",
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-base font-semibold tracking-tight">
            <BrandMark />
            Deep Focus
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/create-resume" className="transition hover:text-foreground">
              Create Resume
            </Link>
            <Link href="/analysis/new" className="transition hover:text-foreground">
              Check Resume
            </Link>
            <Link href="/analyses" className="transition hover:text-foreground">
              Saved Checks
            </Link>
          </nav>
          <Button asChild size="sm">
            <Link href="/create-resume">Start</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(28rem,1fr)] lg:px-8">
        <div className="flex max-w-2xl flex-col gap-7">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Build a resume that scanners and people can read
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Create a clean resume, compare it to a job post, and get plain-language fixes before you print.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button asChild size="lg" className="h-12 justify-between px-4 text-base">
              <Link href="/create-resume">
                <span className="inline-flex items-center gap-2">
                  <FileText data-icon="inline-start" aria-hidden="true" />
                  Create Resume
                </span>
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 justify-between px-4 text-base">
              <Link href="/analysis/new">
                <span className="inline-flex items-center gap-2">
                  <SearchCheck data-icon="inline-start" aria-hidden="true" />
                  Check Resume
                </span>
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 pt-2 sm:grid-cols-3">
            {[
              {
                title: "Scanner-friendly",
                description: "Readable sections and plain text.",
                icon: ShieldCheck,
              },
              {
                title: "Clear advice",
                description: "Simple fixes you can apply.",
                icon: Sparkles,
              },
              {
                title: "Private draft",
                description: "Saved in your browser.",
                icon: FileText,
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="flex min-w-0 items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="hidden min-w-0 lg:block">
          <div className="rounded-xl border bg-background p-4 shadow-sm">
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
              <div className="aspect-[1/1.414] overflow-hidden rounded-lg border bg-white px-8 py-10">
                <ResumeRenderer form={defaultResumeForm} variantId="minimalist-grid" />
              </div>
              <aside className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Job match</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Review missing job words, weak bullets, and section gaps.
                  </p>
                </div>
                {[
                  ["Job title match", "Good"],
                  ["Key skills", "Good"],
                  ["Job words", "Needs work"],
                  ["Impact bullets", "Needs work"],
                ].map(([label, status]) => (
                  <div key={label} className="flex items-center justify-between gap-3 border-t pt-3 text-sm">
                    <span className="font-medium text-foreground">{label}</span>
                    <span className={status === "Good" ? "text-emerald-700" : "text-amber-700"}>{status}</span>
                  </div>
                ))}
              </aside>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
