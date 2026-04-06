export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnailClass: string;
  atsLabel?: string;
  previewVariant:
    | "minimalist-grid"
    | "executive-clean"
    | "standard-technical"
    | "modern-hybrid"
    | "academic-cv"
    | "creative-single-column"
    | "harvard-classic"
    | "modern-sans"
    | "ruby-accent";
  isPremium?: boolean;
}

export const sampleTemplates: ResumeTemplate[] = [
  {
    id: "harvard-classic",
    name: "Harvard Classic",
    description: "The gold standard for legal and financial careers. Features traditional serif typography, a centered header, and strict professional spacing.",
    thumbnailClass: "bg-gradient-to-br from-slate-50 to-slate-200",
    atsLabel: "Full ATS-Optimized",
    previewVariant: "harvard-classic",
    isPremium: true,
  },
  {
    id: "modern-sans",
    name: "Modern Sans",
    description: "A bold, asymmetric layout designed for high-impact tech and creative roles. Uses clean sans-serif lines to maximize readability.",
    thumbnailClass: "bg-gradient-to-br from-blue-50 to-blue-200",
    atsLabel: "ATS-Friendly",
    previewVariant: "modern-sans",
    isPremium: true,
  },
  {
    id: "ruby-accent",
    name: "Ruby Accent",
    description: "An elegant serif design with crimson highlights for emphasis. Ideal for leadership roles that require a touch of personality.",
    thumbnailClass: "bg-gradient-to-br from-rose-50 to-rose-200",
    atsLabel: "Modern Layout",
    previewVariant: "ruby-accent",
    isPremium: true,
  },
  {
    id: "minimalist-grid",
    name: "Minimalist Grid",
    description: "Balanced two-column resume with clean sections and quick scanning. Perfect for multi-role histories.",
    thumbnailClass: "bg-gradient-to-br from-zinc-50 to-zinc-200",
    atsLabel: "ATS-Friendly",
    previewVariant: "minimalist-grid",
  },
  {
    id: "executive-clean",
    name: "Executive Clean",
    description: "Soft editorial spacing with a high-clarity summary and achievements column.",
    thumbnailClass: "bg-gradient-to-br from-cyan-50 to-cyan-200",
    atsLabel: "ATS-Friendly",
    previewVariant: "executive-clean",
  },
  {
    id: "standard-technical",
    name: "Standard Technical",
    description: "Dense dark layout tuned for engineering history, stack depth, and project detail.",
    thumbnailClass: "bg-gradient-to-br from-gray-500 to-gray-700",
    atsLabel: "ATS-Friendly",
    previewVariant: "standard-technical",
  },
  {
    id: "modern-hybrid",
    name: "Modern Hybrid",
    description: "Traditional document proportions with a slightly more modern skills rhythm.",
    thumbnailClass: "bg-gradient-to-br from-emerald-50 to-emerald-200",
    atsLabel: "ATS-Friendly",
    previewVariant: "modern-hybrid",
  },
  {
    id: "academic-cv",
    name: "Academic CV",
    description: "Structured list-heavy format for research, teaching, and publication depth.",
    thumbnailClass: "bg-gradient-to-br from-sky-50 to-sky-200",
    atsLabel: "ATS-Friendly",
    previewVariant: "academic-cv",
  },
  {
    id: "creative-single-column",
    name: "Creative Single-Column",
    description: "High-contrast single-column presentation with a restrained portfolio tone.",
    thumbnailClass: "bg-gradient-to-br from-orange-50 to-indigo-200",
    atsLabel: "ATS-Friendly",
    previewVariant: "creative-single-column",
  },
];
