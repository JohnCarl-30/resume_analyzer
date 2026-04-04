export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnailClass: string;
  isPremium?: boolean;
}

export const sampleTemplates: ResumeTemplate[] = [
  {
    id: "modern",
    name: "Modern Professional",
    description: "Clean lines and ample whitespace. Ideal for tech and corporate roles.",
    thumbnailClass: "bg-gradient-to-br from-emerald-200/20 to-white/5",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Focus purely on content. Perfect for traditional industries.",
    thumbnailClass: "bg-gradient-to-br from-stone-200/10 to-slate-200/5",
  },
  {
    id: "creative",
    name: "Creative Portfolio",
    description: "Stand out with bold typography and a unique layout.",
    thumbnailClass: "bg-gradient-to-br from-amber-200/18 to-emerald-200/12",
    isPremium: true,
  },
];
