import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRightIcon,
  CheckCircledIcon,
  FileIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import { ScrollReveal } from "@/components/scroll-reveal";
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
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="relative z-20 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-base font-semibold tracking-tight">
            <BrandMark />
            Deep Focus
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
            <Link href="/create-resume" className="motion-link hover:text-foreground">
              Create Resume
            </Link>
            <Link href="/analysis/new" className="motion-link hover:text-foreground">
              Check Resume
            </Link>
            <Link href="/analyses" className="motion-link hover:text-foreground">
              Saved Checks
            </Link>
          </nav>
          <Button asChild size="sm" className="h-9 px-4">
            <Link href="/create-resume">Start building</Link>
          </Button>
        </div>
      </header>

      <section className="relative">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[43%] bg-secondary xl:block" />
        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-14 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 xl:grid-cols-[minmax(0,0.82fr)_minmax(34rem,1.18fr)] xl:gap-16 xl:py-24">
          <div className="flex max-w-xl flex-col">
            <ScrollReveal delay={0}>
              <p className="mb-6 w-fit rounded-md border border-primary/15 bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                Resume builder + job match checker
              </p>
            </ScrollReveal>
            <ScrollReveal delay={60}>
              <h1 className="display-serif max-w-[12ch] text-[clamp(2.75rem,6vw,5.25rem)] text-foreground">
                Your resume, with a sharper <em>second draft.</em>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={120}>
              <p className="mt-6 max-w-[58ch] text-base leading-7 text-pretty text-muted-foreground sm:text-lg">
                Build a clean resume or compare the one you have against a real job post. Deep Focus points to the
                missing words, weak bullets, and sections worth fixing.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={180}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 min-w-44 justify-between px-4 text-base">
                <Link href="/create-resume">
                  <span className="inline-flex items-center gap-2">
                    <FileIcon data-icon="inline-start" aria-hidden="true" />
                    Build my resume
                  </span>
                  <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 min-w-44 justify-between px-4 text-base">
                <Link href="/analysis/new">
                  <span className="inline-flex items-center gap-2">
                    <MagnifyingGlassIcon data-icon="inline-start" aria-hidden="true" />
                    Check my resume
                  </span>
                  <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={240}>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {["No account required", "Draft saved in your browser", "Print-ready layouts"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircledIcon aria-hidden="true" className="text-primary" />
                  {item}
                </span>
              ))}
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal className="relative min-w-0 xl:pl-2" delay={100}>
            <div className="motion-lift overflow-hidden rounded-xl border border-primary/15 bg-card shadow-[0_18px_50px_rgba(21,93,252,0.12)]">
              <div className="flex h-12 items-center justify-between border-b border-border bg-background px-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="size-2 rounded-full bg-primary" />
                  Product designer resume
                </div>
                <span className="rounded-md bg-[#ecfdf5] px-2.5 py-1 text-xs font-semibold text-[#0f7a55]">
                  78% match
                </span>
              </div>

              <div className="grid min-h-[30rem] grid-cols-[minmax(0,1fr)_10rem] bg-[#f7f9fc] sm:grid-cols-[minmax(0,1fr)_13rem]">
                <div className="relative overflow-hidden p-4 sm:p-6">
                  <div className="mx-auto aspect-[1/1.414] max-w-[25rem] overflow-hidden border border-border bg-white px-7 py-8 shadow-[0_4px_14px_rgba(15,23,42,0.06)]">
                    <ResumeRenderer form={defaultResumeForm} variantId="minimalist-grid" />
                  </div>
                  <span className="absolute left-[18%] top-[37%] h-1.5 w-[42%] rounded-full bg-primary/18" />
                  <span className="absolute left-[18%] top-[52%] h-1.5 w-[35%] rounded-full bg-primary/18" />
                </div>

                <aside aria-label="Sample resume feedback" className="border-l border-border bg-white">
                  <div className="border-b border-border p-3.5 sm:p-4">
                    <p className="text-xs font-semibold text-foreground sm:text-sm">Review margin</p>
                    <p className="mt-1 hidden text-xs leading-5 text-muted-foreground sm:block">
                      Fixes tied to this job post.
                    </p>
                  </div>
                  {[
                    ["Job words", "Add “user research”", "blue"],
                    ["Bullet 02", "Lead with the outcome", "yellow"],
                    ["Skills", "Move Figma higher", "green"],
                  ].map(([label, note, tone], index) => (
                    <ScrollReveal key={label} as="div" className="relative border-b border-border p-3.5 sm:p-4" delay={index * 70}>
                      <span
                        className={`mb-2 block size-2 rounded-full ${
                          tone === "blue"
                            ? "bg-primary"
                            : tone === "yellow"
                              ? "bg-[#d89a12]"
                              : "bg-success"
                        }`}
                      />
                      <p className="text-[0.68rem] font-semibold tracking-wide text-muted-foreground uppercase">
                        {label}
                      </p>
                      <p className="mt-1 text-xs font-medium leading-5 text-foreground sm:text-sm">{note}</p>
                      <span className="absolute right-3 top-3 font-mono text-[0.62rem] text-muted-foreground">
                        0{index + 1}
                      </span>
                    </ScrollReveal>
                  ))}
                </aside>
              </div>
            </div>

            <ScrollReveal
              className="absolute -bottom-5 -left-2 hidden sm:block"
              delay={280}
            >
              <div className="rounded-lg border border-primary/15 bg-primary px-4 py-3 text-primary-foreground shadow-[0_8px_24px_rgba(21,93,252,0.2)]">
                <p className="text-xs font-medium text-primary-foreground/75">Strongest improvement</p>
                <p className="mt-0.5 text-sm font-semibold">Turn tasks into measurable outcomes.</p>
              </div>
            </ScrollReveal>
          </ScrollReveal>
        </div>
      </section>

      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <ScrollReveal>
              <div>
              <h2 className="display-serif max-w-[12ch] text-3xl text-foreground sm:text-4xl">
                The useful kind of feedback.
              </h2>
              <p className="mt-4 max-w-[48ch] text-base leading-7 text-muted-foreground">
                Every note points to a specific part of your resume, so you always know what to change next.
              </p>
              </div>
            </ScrollReveal>

            <div className="divide-y divide-border border-y border-border">
              {[
                ["Match the role", "Compare your language with the job post and find important words you missed."],
                ["Strengthen the proof", "Spot bullets that describe activity but leave out the result."],
                ["Keep it readable", "Use familiar sections and layouts that work for scanners and hiring teams."],
              ].map(([title, description], index) => (
                <ScrollReveal
                  key={title}
                  className="grid gap-3 py-5 sm:grid-cols-[2rem_10rem_1fr] sm:items-start sm:gap-5"
                  delay={index * 60}
                >
                  <span className="font-mono text-xs text-primary">0{index + 1}</span>
                  <h3 className="text-base font-semibold text-foreground">{title}</h3>
                  <p className="max-w-[54ch] text-sm leading-6 text-muted-foreground">{description}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <ScrollReveal>
            <div>
            <h2 className="display-serif text-3xl text-foreground sm:text-4xl">Start with the resume you need.</h2>
            <p className="mt-2 text-base text-muted-foreground">Build one from scratch or improve the draft you already have.</p>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-11 px-4">
              <Link href="/create-resume">
                Build a resume
                <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 border-primary/20 bg-white px-4">
              <Link href="/analysis/new">
                Check a resume
              </Link>
            </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <footer className="border-t border-border bg-background">
        <ScrollReveal>
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 font-medium text-foreground">
            <BrandMark />
            Deep Focus
          </span>
          <span>Clear resumes. Specific feedback.</span>
          </div>
        </ScrollReveal>
      </footer>
    </main>
  );
}
