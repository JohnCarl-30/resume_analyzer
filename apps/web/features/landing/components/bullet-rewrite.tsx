import { ArrowDownIcon } from "@radix-ui/react-icons";

import { ScrollReveal } from "@/components/scroll-reveal";

export function BulletRewrite() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <ScrollReveal as="header" className="max-w-[44ch]">
          <p className="app-section-label">Bullet strength</p>
          <h2 className="display-serif mt-2 text-2xl text-foreground sm:text-3xl">
            Most bullets say what you did. Few say what changed.
          </h2>
        </ScrollReveal>

        <div className="mt-10 space-y-3">
          <ScrollReveal
            delay={60}
            className="rounded-[var(--radius-xl)] border border-border bg-card p-5 sm:p-6"
          >
            <p className="text-caption text-muted-foreground">What you wrote</p>
            <p className="mt-2 text-base leading-7 text-muted-foreground">
              Responsible for maintaining the billing service and fixing bugs reported by the
              support team.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={140} className="flex justify-center py-1">
            <span
              className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground"
              aria-hidden="true"
            >
              <ArrowDownIcon />
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
            <p className="mt-2 text-base leading-7 text-foreground">
              Cut billing incidents by{" "}
              <mark
                className="rounded px-1"
                style={{ background: "color-mix(in oklab, var(--success) 22%, transparent)" }}
              >
                40%
              </mark>{" "}
              by adding retry logic and{" "}
              <mark
                className="rounded px-1"
                style={{ background: "color-mix(in oklab, var(--success) 22%, transparent)" }}
              >
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
