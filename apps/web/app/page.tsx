import Link from "next/link";
import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Button } from "@/components/ui/button";
import { HeaderAuthActions } from "@/features/auth/components/header-auth-actions";
import { ResumeRenderer } from "@/features/editor/components/resume-renderer";
import { defaultResumeForm } from "@/features/editor/model/resume-form";
import { HeroAtmosphere } from "@/features/landing/components/hero-atmosphere";
import { RotatingWord } from "@/features/landing/components/rotating-word";
import { BrandMark } from "@/features/onboarding/components/wizard-icons";

export const metadata: Metadata = {
  title: "Resume Builder and Job Match Checker",
  description:
    "Create a clean resume or check an existing resume against a job description with plain-language guidance.",
  alternates: {
    canonical: "/",
  },
};

const CALLOUTS = [
  {
    number: "01",
    label: "Job words",
    insight: "Words the posting repeats often — but your summary never uses — get flagged here.",
    position: { top: "10%", left: "97%" },
    dot: "bg-primary",
  },
  {
    number: "02",
    label: "Bullet strength",
    insight: "A bullet that names activity but not outcome gets a note: what changed because of it?",
    position: { top: "62%", left: "3%" },
    dot: "bg-[var(--tag-bullet)]",
  },
  {
    number: "03",
    label: "Layout & scan",
    insight: "Dense paragraphs and long section names slow a six-second skim. We flag both.",
    position: { top: "80%", left: "97%" },
    dot: "bg-success",
  },
] as const;

function enterDelay(ms: number): CSSProperties {
  return { "--enter-delay": `${ms}ms` } as CSSProperties;
}

function pinDelay(ms: number): CSSProperties {
  return { "--pin-delay": `${ms}ms` } as CSSProperties;
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="brand-logo inline-flex items-center gap-2 text-base font-semibold tracking-tight"
          >
            <BrandMark />
            <span className="font-brand">Deep Focus</span>
          </Link>
          <HeaderAuthActions />
        </div>
      </header>

      <section className="relative overflow-hidden">
        <HeroAtmosphere />

        <div className="relative z-10 mx-auto max-w-3xl px-4 pt-16 pb-14 sm:px-6 sm:pt-20 sm:pb-16 lg:px-8">
          <h1
            className="animate-enter-up display-serif max-w-[28ch] text-[length:var(--text-display)] text-foreground"
            style={enterDelay(0)}
          >
            Paste a job post. See what your <RotatingWord /> needs.
          </h1>
          <p
            className="animate-enter-up mt-5 max-w-[58ch] text-base leading-7 text-muted-foreground sm:text-lg"
            style={enterDelay(90)}
          >
            Deep Focus lines your resume up against the posting and marks exactly where it falls
            short — the words that are missing, the bullets that undersell you, the layout that
            is hard to scan.
          </p>
          <p className="animate-enter-up mt-6 text-sm text-muted-foreground" style={enterDelay(170)}>
            Starting from a blank page?{" "}
            <Link
              href="/create-resume"
              className="motion-link font-medium text-primary underline-offset-4 hover:underline"
            >
              Build a clean resume first, no sign-in needed
            </Link>
          </p>
        </div>
      </section>

      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <ScrollReveal as="header" className="max-w-[42ch] pb-10 sm:pb-12">
            <h2 className="display-serif text-2xl text-foreground sm:text-3xl">
              Here&rsquo;s exactly what gets marked up.
            </h2>
            <p className="mt-3 max-w-[46ch] text-sm leading-6 text-muted-foreground sm:text-base">
              One real job post, one real resume, three kinds of notes.
            </p>
          </ScrollReveal>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,1fr)] lg:items-start lg:gap-14">
            <ScrollReveal as="figure" className="min-w-0" delay={80}>
              <div className="relative mx-auto aspect-[1/1.32] max-w-[26rem] overflow-hidden border border-border bg-card px-6 py-7">
                <ResumeRenderer form={defaultResumeForm} variantId="minimalist-grid" />
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-card to-transparent"
                />
                {CALLOUTS.map((callout, index) => (
                  <span
                    key={callout.number}
                    aria-hidden="true"
                    className="callout-pin absolute z-10 flex size-6 items-center justify-center rounded-full border border-border bg-background font-mono text-[0.62rem] font-semibold text-foreground shadow-[var(--shadow-md)]"
                    style={{
                      top: callout.position.top,
                      left: callout.position.left,
                      ...pinDelay(220 + index * 120),
                    }}
                  >
                    {callout.number}
                  </span>
                ))}
              </div>
              <figcaption className="mt-3 text-xs text-muted-foreground">
                Sample check on Deep Focus&rsquo;s own placeholder resume.
              </figcaption>
            </ScrollReveal>

            <ol className="flex flex-col gap-7">
              {CALLOUTS.map((callout, index) => (
                <ScrollReveal
                  as="li"
                  key={callout.number}
                  className="flex gap-3"
                  delay={140 + index * 90}
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border font-mono text-[0.62rem] font-semibold text-foreground"
                  >
                    {callout.number}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                      <span
                        className={`size-1.5 shrink-0 rounded-full ${callout.dot}`}
                        aria-hidden="true"
                      />
                      {callout.label}
                    </p>
                    <p className="mt-1.5 text-sm leading-6 text-foreground">{callout.insight}</p>
                  </div>
                </ScrollReveal>
              ))}
            </ol>
          </div>
        </div>

        <aside className="sticky bottom-0 border-t border-border bg-background/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <p className="text-sm text-muted-foreground">One AI check per account, free to start.</p>
            <Button asChild size="lg" className="h-11 justify-between gap-2 px-4 text-base sm:w-auto">
              <Link href="/analysis/new">
                Check my resume
                <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </aside>
      </section>

      <footer className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
            <Link
              href="/"
              className="brand-logo inline-flex items-center gap-2 text-base font-semibold tracking-tight text-foreground"
            >
              <BrandMark />
              <span className="font-brand">Deep Focus</span>
            </Link>
            <p className="max-w-[36ch] text-sm text-muted-foreground sm:text-right">
              Line-by-line notes, tied to the job post you&rsquo;re targeting.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted-foreground"
          >
            <Link href="/create-resume" className="motion-link hover:text-foreground">
              Build a resume
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/auth/sign-in?next=%2Fanalysis%2Fnew" className="motion-link hover:text-foreground">
              Check a resume
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/auth/sign-in?next=%2Fhome" className="motion-link hover:text-foreground">
              Saved checks
            </Link>
          </nav>

          <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>Sign in to run one AI check per account. Drafts stay in your browser until you save one.</p>
            <p className="font-mono tracking-[0.08em] uppercase">Deep Focus</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
