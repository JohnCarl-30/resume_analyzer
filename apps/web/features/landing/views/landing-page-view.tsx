import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { ScrollReveal } from "@/components/scroll-reveal";
import { Button } from "@/components/ui/button";
import { BulletRewrite } from "@/features/landing/components/bullet-rewrite";
import { ClosingCta } from "@/features/landing/components/closing-cta";
import { FaqSection } from "@/features/landing/components/faq-section";
import { FeatureGrid } from "@/features/landing/components/feature-grid";
import { HeroAtmosphere } from "@/features/landing/components/hero-atmosphere";
import { HeroPreview } from "@/features/landing/components/hero-preview";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { MarkupTour } from "@/features/landing/components/markup-tour";
import { RotatingWord } from "@/features/landing/components/rotating-word";
import { StickyCta } from "@/features/landing/components/sticky-cta";
import { BrandMark } from "@/features/onboarding/components/wizard-icons";

function enterDelay(ms: number): CSSProperties {
  return { "--enter-delay": `${ms}ms` } as CSSProperties;
}

export function LandingPageView() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <LandingHeader />

      <section className="relative overflow-hidden">
        <HeroAtmosphere />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pt-12 pb-px sm:px-6 sm:pt-20 lg:px-8">
          <Link
            href="/create-resume"
            className="animate-enter-up landing-link inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
            style={enterDelay(0)}
          >
            <span className="font-medium text-foreground">Free</span>
            Build a resume without signing in
            <ArrowRightIcon aria-hidden="true" />
          </Link>

          {/* Headline left, pitch and actions right: the two halves read as
              claim and proof instead of one centred stack. */}
          <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-12">
            <h1
              className="animate-enter-up display-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.02] tracking-[-0.035em] text-foreground lg:col-span-7"
              style={enterDelay(80)}
            >
              {/* Split so the rotating word only ever resizes its own line. */}
              <span className="block">Paste a job post.</span>
              <span className="block">
                See what your <RotatingWord /> needs.
              </span>
            </h1>

            <div className="lg:col-span-5 lg:pb-2">
              <p
                className="animate-enter-up max-w-[46ch] text-base leading-7 text-pretty text-muted-foreground sm:text-lg"
                style={enterDelay(160)}
              >
                Resumae lines your resume up against the posting and marks exactly where it falls
                short — the words that are missing, the bullets that undersell you, the layout that
                is hard to scan.
              </p>

              <div
                className="animate-enter-up mt-7 flex flex-col gap-3 sm:flex-row"
                style={enterDelay(240)}
              >
                <Button asChild size="lg" className="cta-sheen h-11 gap-2 px-5 text-base">
                  <Link href="/analysis/new">
                    Check my resume
                    <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-11 gap-2 px-5 text-base">
                  <Link href="/create-resume">Build a resume first</Link>
                </Button>
              </div>

              <p
                className="animate-enter-up mt-4 text-sm text-muted-foreground"
                style={enterDelay(320)}
              >
                Building is free and needs no sign-in. Checking uses one free AI review per account.
              </p>
            </div>
          </div>

          {/* The product shot sits directly under the calls to action and runs
              past the fold, so the page reads as a tool rather than a pitch. */}
          <div
            className="animate-enter-up mt-12 sm:mt-16"
            style={enterDelay(400)}
          >
            <HeroPreview />
          </div>
        </div>

      </section>

      <HowItWorks />

      <section className="border-t border-border bg-[var(--landing-band)]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <ScrollReveal as="header" className="max-w-[42ch] pb-10 sm:pb-12">
            <p className="app-section-label">The markup</p>
            <h2 className="display-serif mt-2 text-3xl text-foreground sm:text-4xl">
              Here&rsquo;s exactly what gets marked up.
            </h2>
            <p className="mt-3 max-w-[46ch] text-sm leading-6 text-muted-foreground sm:text-base">
              One real job post, one real resume, three kinds of notes.
            </p>
          </ScrollReveal>

          <MarkupTour />
        </div>

        <StickyCta />
      </section>

      <BulletRewrite />

      <FeatureGrid />

      <FaqSection />

      <ClosingCta />

      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
            <Link
              href="/"
              className="brand-logo inline-flex items-center gap-2 text-base font-semibold tracking-tight text-foreground"
            >
              <BrandMark />
              <span className="font-brand">Resumae</span>
            </Link>
            <p className="max-w-[36ch] text-sm text-muted-foreground sm:text-right">
              Line-by-line notes, tied to the job post you&rsquo;re targeting.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted-foreground"
          >
            <Link href="/create-resume" className="landing-link hover:text-foreground">
              Build a resume
            </Link>
            <span aria-hidden="true">·</span>
            <Link
              href="/auth/sign-in?next=%2Fanalysis%2Fnew"
              className="landing-link hover:text-foreground"
            >
              Check a resume
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/auth/sign-in?next=%2Fhome" className="landing-link hover:text-foreground">
              Saved checks
            </Link>
          </nav>

          <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>
              Sign in to run one AI check per account. Drafts stay in your browser until you save
              one.
            </p>
            <p>Built by John Carl Santos</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
