import { ArrowDownIcon, ArrowRightIcon } from "@radix-ui/react-icons";

import { ScrollReveal } from "@/components/scroll-reveal";

const HIGHLIGHT = { background: "color-mix(in oklab, var(--success) 22%, transparent)" };

export function BulletRewrite() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <ScrollReveal as="header" className="max-w-[44ch]">
          <p className="app-section-label">Bullet strength</p>
          <h2 className="display-serif mt-2 text-3xl text-foreground sm:text-4xl">
            Most bullets say what you did. Few say what changed.
          </h2>
        </ScrollReveal>

        {/* Before and after share one row on wide screens so the eye compares
            them directly; the arrow turns to point down once they stack. */}
        <div className="mt-10 grid items-stretch gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-4">
          <ScrollReveal
            delay={60}
            className="rounded-[var(--radius-xl)] border border-border bg-card p-5 sm:p-6"
          >
            <p className="text-caption text-muted-foreground">What you wrote</p>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Responsible for maintaining the billing service and fixing bugs reported by the
              support team.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={140} className="flex items-center justify-center py-1">
            <span
              className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
              aria-hidden="true"
            >
              <ArrowDownIcon className="md:hidden" />
              <ArrowRightIcon className="hidden md:block" />
            </span>
          </ScrollReveal>

          <ScrollReveal
            delay={220}
            className="rounded-[var(--radius-xl)] border p-5 sm:p-6"
            style={{
              borderColor: "color-mix(in oklab, var(--success) 35%, var(--border))",
              background: "color-mix(in oklab, var(--success) 7%, var(--card))",
            }}
          >
            <p className="text-caption" style={{ color: "var(--success)" }}>
              What the posting rewards
            </p>
            <p className="mt-3 text-base leading-7 text-foreground">
              Cut billing incidents by{" "}
              <mark className="rounded px-1" style={HIGHLIGHT}>
                40%
              </mark>{" "}
              by adding retry logic and{" "}
              <mark className="rounded px-1" style={HIGHLIGHT}>
                alerting
              </mark>
              , cutting support escalations from 12 a week to 3.
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal
          delay={300}
          as="p"
          className="mt-6 max-w-[52ch] text-sm leading-6 text-muted-foreground"
        >
          Every flagged bullet comes with a suggestion you can accept, edit, or ignore. Nothing is
          rewritten without you seeing it first.
        </ScrollReveal>
      </div>
    </section>
  );
}
