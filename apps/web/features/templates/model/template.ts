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
    description: "The gold standard for professional careers. Serif fonts, centered header, and traditional spacing.",
    thumbnailClass: "bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0]",
    atsLabel: "High Success",
    previewVariant: "harvard-classic",
  },
  {
    id: "modern-sans",
    name: "Modern Sans",
    description: "A clean, high-impact sans-serif layout with an asymmetric header. Perfect for tech and startups.",
    thumbnailClass: "bg-gradient-to-br from-[#f1f5f9] to-[#cbd5e1]",
    atsLabel: "ATS-Friendly",
    previewVariant: "modern-sans",
  },
  {
    id: "ruby-accent",
    name: "Ruby Accent",
    description: "Professional serif layout with subtle crimson highlights to make key sections pop.",
    thumbnailClass: "bg-gradient-to-br from-[#fff1f2] to-[#fecdd3]",
    atsLabel: "Modern",
    previewVariant: "ruby-accent",
  },
  {
    id: "minimalist-grid",
    name: "Minimalist Grid",
    description: "Balanced two-column resume with clean sections and quick scanning.",
    thumbnailClass: "bg-gradient-to-br from-[#c4b6b0] to-[#9a8f8b]",
    atsLabel: "ATS-Friendly",
    previewVariant: "minimalist-grid",
  },
  {
    id: "executive-clean",
    name: "Executive Clean",
    description: "Soft editorial spacing with a high-clarity summary and achievements column.",
    thumbnailClass: "bg-gradient-to-br from-[#9bb5ba] to-[#789ca3]",
    atsLabel: "ATS-Friendly",
    previewVariant: "executive-clean",
  },
  {
    id: "standard-technical",
    name: "Standard Technical",
    description: "Dense dark layout tuned for engineering history, stack depth, and project detail.",
    thumbnailClass: "bg-gradient-to-br from-[#55616b] to-[#2b3640]",
    atsLabel: "ATS-Friendly",
    previewVariant: "standard-technical",
  },
  {
    id: "modern-hybrid",
    name: "Modern Hybrid",
    description: "Traditional document proportions with a slightly more modern skills rhythm.",
    thumbnailClass: "bg-gradient-to-br from-[#dbe3de] to-[#b8c7c0]",
    atsLabel: "ATS-Friendly",
    previewVariant: "modern-hybrid",
  },
  {
    id: "academic-cv",
    name: "Academic CV",
    description: "Structured list-heavy format for research, teaching, and publication depth.",
    thumbnailClass: "bg-gradient-to-br from-[#d7edf7] to-[#bfdde9]",
    atsLabel: "ATS-Friendly",
    previewVariant: "academic-cv",
  },
  {
    id: "creative-single-column",
    name: "Creative Single-Column",
    description: "High-contrast single-column presentation with a restrained portfolio tone.",
    thumbnailClass: "bg-gradient-to-br from-[#f1a58d] to-[#526280]",
    atsLabel: "ATS-Friendly",
    previewVariant: "creative-single-column",
  },
];
