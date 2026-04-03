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
    thumbnailClass: "bg-gradient-to-br from-indigo-500/20 to-cyan-500/20",
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Focus purely on content. Perfect for traditional industries.",
    thumbnailClass: "bg-gradient-to-br from-slate-400/20 to-slate-200/20",
  },
  {
    id: "creative",
    name: "Creative Portfolio",
    description: "Stand out with bold typography and a unique layout.",
    thumbnailClass: "bg-gradient-to-br from-fuchsia-500/20 to-amber-500/20",
    isPremium: true,
  },
];
