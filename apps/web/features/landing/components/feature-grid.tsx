import type { ReactNode } from "react";
import {
  CheckCircledIcon,
  DownloadIcon,
  FileTextIcon,
  LayersIcon,
  MagnifyingGlassIcon,
  Pencil2Icon,
} from "@radix-ui/react-icons";

import { ScrollReveal } from "@/components/scroll-reveal";
import { cn } from "@/lib/utils";

interface Feature {
  icon: ReactNode;
  title: string;
  body: string;
  /** A small piece of product UI; features with one span two columns. */
  visual?: ReactNode;
}

function KeywordVisual() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-background p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-caption text-muted-foreground">Match</span>
        <span className="font-mono text-sm font-semibold tabular-nums text-foreground">78%</span>
      </div>
      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted">
        <span className="block h-full w-[78%] rounded-full bg-primary" />
      </span>
      <ul className="mt-4 flex flex-wrap gap-1.5 text-xs">
        {["TypeScript", "Postgres", "CI/CD"].map((word) => (
          <li
            key={word}
            className="rounded-full px-2 py-0.5"
            style={{
              background: "color-mix(in oklab, var(--success) 14%, transparent)",
              color: "var(--success)",
            }}
          >
            {word}
          </li>
        ))}
        {["Kubernetes", "gRPC"].map((word) => (
          <li
            key={word}
            className="rounded-full border border-dashed px-2 py-0.5 text-primary"
            style={{ borderColor: "color-mix(in oklab, var(--primary) 45%, transparent)" }}
          >
            {word}
          </li>
        ))}
      </ul>
    </div>
  );
}

const TEMPLATES = [
  { name: "Harvard Classic", serif: true, centered: true },
  { name: "Modern Sans", serif: false, centered: false },
  { name: "Ruby Accent", serif: true, centered: false, accent: "oklch(52% 0.17 20)" },
  { name: "Minimalist Grid", serif: false, centered: false, rule: true },
] as const;

function TemplatesVisual() {
  return (
    <ul className="grid grid-cols-4 gap-2">
      {TEMPLATES.map((template) => (
        <li key={template.name} className="min-w-0">
          <div className="aspect-[1/1.3] rounded-[calc(var(--radius-lg)*0.6)] border border-border bg-background p-2 shadow-[var(--shadow-md)]">
            <span
              className={cn(
                "block h-1.5 w-3/5 rounded-full",
                "centered" in template && template.centered && "mx-auto",
              )}
              style={{
                background:
                  "accent" in template ? template.accent : "color-mix(in oklab, var(--foreground) 70%, transparent)",
              }}
            />
            {"rule" in template ? <span className="mt-1.5 block h-px bg-border" /> : null}
            <span className="mt-2 block space-y-1">
              {[90, 70, 84, 60, 76].map((width) => (
                <span
                  key={width}
                  className="block h-1 rounded-full"
                  style={{
                    width: `${width}%`,
                    background: "color-mix(in oklab, var(--foreground) 12%, transparent)",
                  }}
                />
              ))}
            </span>
          </div>
          <p
            className={cn(
              "mt-1.5 text-[0.68rem] leading-tight text-balance text-muted-foreground",
              template.serif && "font-display",
            )}
          >
            {template.name}
          </p>
        </li>
      ))}
    </ul>
  );
}

function EditorVisual() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-background">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <span className="text-caption text-muted-foreground">Experience · bullet 2</span>
        <span className="flex gap-1 font-mono text-[0.65rem] text-muted-foreground">
          <kbd className="rounded border border-border px-1.5 py-0.5">⌘Z</kbd>
          <kbd className="rounded border border-border px-1.5 py-0.5">⇧⌘Z</kbd>
        </span>
      </div>
      <p className="px-3 py-3 text-sm leading-6 text-foreground">
        Cut support escalations from 12 a week{" "}
        <span className="whitespace-nowrap">
          to 3
          <span
            aria-hidden="true"
            className="ml-px inline-block h-4 w-px translate-y-0.5 bg-primary motion-safe:animate-pulse"
          />
        </span>
      </p>
    </div>
  );
}

// Three wide cards and three narrow ones total nine columns, which fills
// three rows of the three column grid exactly. Changing one width without
// changing another leaves a hole in the row.
const FEATURES: Feature[] = [
  {
    icon: <MagnifyingGlassIcon />,
    title: "Keyword match",
    body: "Every term the posting leans on, checked against what your resume actually says — and a score for how close you are.",
    visual: <KeywordVisual />,
  },
  {
    icon: <Pencil2Icon />,
    title: "Bullet suggestions",
    body: "Rewrites that add the outcome a bullet is missing.",
  },
  {
    icon: <FileTextIcon />,
    title: "PDF and DOCX",
    body: "Upload either. The text comes out, formatting and all.",
  },
  {
    icon: <LayersIcon />,
    title: "Four templates",
    body: "Harvard Classic, Modern Sans, Ruby Accent and Minimalist Grid — all built to survive a scanner.",
    visual: <TemplatesVisual />,
  },
  {
    icon: <CheckCircledIcon />,
    title: "Live editor",
    body: "Edit sections inline with undo and redo, next to a preview that updates as you type.",
    visual: <EditorVisual />,
  },
  {
    icon: <DownloadIcon />,
    title: "Export",
    body: "Print to PDF straight from the browser.",
  },
];

export function FeatureGrid() {
  return (
    <section className="border-t border-border bg-[var(--landing-band)]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <ScrollReveal as="header" className="max-w-[44ch] pb-10">
          <p className="app-section-label">What you get</p>
          <h2 className="display-serif mt-2 text-3xl text-foreground sm:text-4xl">
            A check, then the tools to act on it.
          </h2>
        </ScrollReveal>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <ScrollReveal
              key={feature.title}
              delay={index * 60}
              className={cn(
                "motion-lift flex flex-col rounded-[var(--radius-2xl)] border border-border bg-card p-6",
                feature.visual &&
                  "lg:col-span-2 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-8",
              )}
            >
              <div>
                <span
                  className="flex size-8 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--brand-soft)] text-primary"
                  aria-hidden="true"
                >
                  {feature.icon}
                </span>
                <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-1.5 max-w-[42ch] text-sm leading-6 text-pretty text-muted-foreground">
                  {feature.body}
                </p>
              </div>

              {feature.visual ? (
                <div className="mt-6 lg:mt-0" aria-hidden="true">
                  {feature.visual}
                </div>
              ) : null}
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
