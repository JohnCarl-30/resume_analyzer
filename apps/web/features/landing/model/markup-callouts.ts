export interface MarkupCallout {
  number: string;
  label: string;
  insight: string;
  /** Pin anchor inside the resume figure, in percentages. */
  pin: { top: string; left: string };
  /** Band the scanner rests on while this callout is active, in percentages. */
  band: { top: number; height: number };
  /** Accent colour token for the pin, band and list marker. */
  color: string;
}

export const MARKUP_CALLOUTS: readonly MarkupCallout[] = [
  {
    number: "01",
    label: "Job words",
    insight: "Words the posting repeats often — but your summary never uses — get flagged here.",
    pin: { top: "10%", left: "97%" },
    band: { top: 4, height: 17 },
    color: "var(--primary)",
  },
  {
    number: "02",
    label: "Bullet strength",
    insight: "A bullet that names activity but not outcome gets a note: what changed because of it?",
    pin: { top: "62%", left: "3%" },
    band: { top: 54, height: 18 },
    color: "var(--tag-bullet)",
  },
  {
    number: "03",
    label: "Layout & scan",
    insight: "Dense paragraphs and long section names slow a six-second skim. We flag both.",
    pin: { top: "80%", left: "97%" },
    band: { top: 72, height: 20 },
    color: "var(--success)",
  },
] as const;
