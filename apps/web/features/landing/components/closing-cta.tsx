import Link from "next/link";
import { ArrowRightIcon } from "@radix-ui/react-icons";

import { ScrollReveal } from "@/components/scroll-reveal";
import { Button } from "@/components/ui/button";

/**
 * Repeats the hero's offer at the end of the page, for readers who scrolled
 * past it to decide.
 */
export function ClosingCta() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24 lg:px-8">
        {/* A contained panel in the auth stage's slate, rather than a full-bleed
            dark band: the page stays light, the ending still reads as one. */}
        <ScrollReveal
          className="relative overflow-hidden rounded-[var(--radius-2xl)] px-6 py-12 sm:px-10 sm:py-14 lg:px-14"
          style={{ background: "var(--auth-stage)", color: "var(--auth-stage-text)" }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(36rem 20rem at 100% 0%, color-mix(in oklab, var(--brand) 38%, transparent), transparent 70%)",
            }}
          />

          <div className="relative grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <h2 className="display-serif text-3xl sm:text-4xl">
                See what your resume is missing.
              </h2>
              <p
                className="mt-3 max-w-[46ch] text-sm leading-6 sm:text-base"
                style={{ color: "var(--auth-stage-muted)" }}
              >
                One free AI check per account. Building a resume from scratch stays free and needs
                no sign-in.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:col-span-5 lg:justify-end">
              <Button asChild size="lg" className="cta-sheen h-11 gap-2 px-5 text-base">
                <Link href="/analysis/new">
                  Check my resume
                  <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
              <Link
                href="/create-resume"
                className="inline-flex h-11 items-center justify-center rounded-md px-3 text-base font-medium underline-offset-4 transition-opacity hover:underline active:opacity-80 focus-visible:ring-2 focus-visible:ring-[var(--auth-stage-text)] focus-visible:outline-none"
              >
                Build a resume first
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
