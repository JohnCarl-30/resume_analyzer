import { z } from "zod";

const experienceEntrySchema = z.object({
  id: z.string().min(1),
  role: z.string(),
  location: z.string().optional().default(""),
  dateRange: z.string().optional().default(""),
  bullets: z.array(z.string()),
});

export const tailorResumeSchema = z.object({
  targetRole: z.string().min(1),
  jobDescription: z.string().min(30),
  missingKeywords: z.array(z.string()).default([]),
  matchedKeywords: z.array(z.string()).default([]),
  form: z.object({
    personalInfo: z.object({
      fullName: z.string().optional().default(""),
      phone: z.string().optional().default(""),
      email: z.string().optional().default(""),
      summary: z.string().optional().default(""),
      skills: z.string().optional().default(""),
    }),
    experience: z.array(experienceEntrySchema).default([]),
  }),
});

export type TailorResumeInput = z.infer<typeof tailorResumeSchema>;

export interface TailorResumeBulletChange {
  before: string[];
  after: string[];
}

export interface TailorResumeExperienceChange {
  id: string;
  role: string;
  bullets: TailorResumeBulletChange;
}

export interface TailorResumeDraft {
  summary: { before: string; after: string };
  skills: { before: string; after: string };
  experience: TailorResumeExperienceChange[];
}
