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

interface Feature {
  icon: ReactNode;
  title: string;
  body: string;
  wide?: boolean;
}

// Three wide cards and three narrow ones total nine columns, which fills
// three rows of the three column grid exactly. Changing one width without
// changing another leaves a hole in the row.
const FEATURES: Feature[] = [
  {
    icon: <MagnifyingGlassIcon />,
    title: "Keyword match",
    body: "Every term the posting leans on, checked against what your resume actually says — and a score for how close you are.",
    wide: true,
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
    wide: true,
  },
  {
    icon: <CheckCircledIcon />,
    title: "Live editor",
    body: "Edit sections inline with undo and redo, next to a preview that updates as you type.",
    wide: true,
  },
  {
    icon: <DownloadIcon />,
    title: "Export",
    body: "Print to PDF straight from the browser.",
  },
];

export function FeatureGrid() {
  return (
    <section className="border-t border-border bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <ScrollReveal as="header" className="max-w-[44ch] pb-10">
          <p className="app-section-label">What you get</p>
          <h2 className="display-serif mt-2 text-2xl text-foreground sm:text-3xl">
            A check, then the tools to act on it.
          </h2>
        </ScrollReveal>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <ScrollReveal
              key={feature.title}
              delay={index * 60}
              className={`motion-lift rounded-[var(--radius-xl)] border border-border bg-card p-5 ${
                feature.wide ? "lg:col-span-2" : ""
              }`}
            >
              <span className="text-muted-foreground" aria-hidden="true">
                {feature.icon}
              </span>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-1.5 max-w-[46ch] text-sm leading-6 text-muted-foreground">
                {feature.body}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
