export const resumeTemplateVariants = [
  "minimalist-grid",
  "harvard-classic",
  "modern-sans",
  "ruby-accent",
] as const;

export type ResumeTemplateVariant = (typeof resumeTemplateVariants)[number];

export function isResumeTemplateVariant(value: string): value is ResumeTemplateVariant {
  return resumeTemplateVariants.includes(value as ResumeTemplateVariant);
}

export interface ResumeTemplate {
  id: ResumeTemplateVariant;
  name: string;
  description: string;
  thumbnailClass: string;
  atsLabel?: string;
  previewVariant: ResumeTemplateVariant;
  isPremium?: boolean;
}

export const sampleTemplates: ResumeTemplate[] = [
  {
    id: "minimalist-grid",
    name: "Minimalist Grid",
    description:
      "Balanced two-column structure for general ATS-safe applications. Best when you want a versatile layout with fast scanning.",
    thumbnailClass: "bg-gradient-to-br from-zinc-50 to-zinc-200",
    atsLabel: "ATS-Friendly",
    previewVariant: "minimalist-grid",
  },
  {
    id: "harvard-classic",
    name: "Harvard Classic",
    description:
      "A formal serif layout with disciplined spacing and traditional hierarchy. Best for conservative, academic, and leadership-facing roles.",
    thumbnailClass: "bg-gradient-to-br from-slate-50 to-slate-200",
    atsLabel: "Full ATS-Optimized",
    previewVariant: "harvard-classic",
    isPremium: true,
  },
  {
    id: "modern-sans",
    name: "Modern Sans",
    description:
      "A sharper, high-contrast layout for product, tech, and modern professional roles. Best when you want a cleaner, more contemporary tone.",
    thumbnailClass: "bg-gradient-to-br from-blue-50 to-blue-200",
    atsLabel: "ATS-Friendly",
    previewVariant: "modern-sans",
    isPremium: true,
  },
  {
    id: "ruby-accent",
    name: "Ruby Accent",
    description:
      "An editorial serif resume with restrained accent treatment. Best when you want something expressive but still readable and professional.",
    thumbnailClass: "bg-gradient-to-br from-rose-50 to-rose-200",
    atsLabel: "ATS-Friendly",
    previewVariant: "ruby-accent",
    isPremium: true,
  },
];
