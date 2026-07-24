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
  atsRecommended?: boolean;
  previewVariant: ResumeTemplateVariant;
  isPremium?: boolean;
}

export const sampleTemplates: ResumeTemplate[] = [
  {
    id: "minimalist-grid",
    name: "Minimalist Grid",
    description:
      "Clean structure, standard headings, and no graphics that confuse scanners.",
    thumbnailClass: "bg-[color:var(--page-bg)]",
    atsLabel: "Best for scanners",
    atsRecommended: true,
    previewVariant: "minimalist-grid",
  },
  {
    id: "harvard-classic",
    name: "Harvard Classic",
    description:
      "Formal serif layout with traditional hierarchy for conservative or academic roles.",
    thumbnailClass: "bg-[color:var(--page-bg)]",
    atsLabel: "Good for scanners",
    previewVariant: "harvard-classic",
    isPremium: true,
  },
  {
    id: "modern-sans",
    name: "Modern Sans",
    description:
      "High-contrast sans layout suited to product, tech, and modern professional roles.",
    thumbnailClass: "bg-[color:var(--page-bg)]",
    atsLabel: "Good for scanners",
    previewVariant: "modern-sans",
    isPremium: true,
  },
  {
    id: "ruby-accent",
    name: "Ruby Accent",
    description:
      "Editorial serif with a restrained accent—expressive, but still easy to read.",
    thumbnailClass: "bg-[color:var(--page-bg)]",
    atsLabel: "Good for scanners",
    previewVariant: "ruby-accent",
    isPremium: true,
  },
];
