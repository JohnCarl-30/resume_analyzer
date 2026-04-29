import { z } from "zod";

export const createAnalysisSchema = z.object({
  targetRole: z.string().trim().min(2),
  jobDescription: z.string().trim().min(30),
  resumeText: z.string().trim().min(30),
});

export const createUploadedAnalysisSchema = z.object({
  targetRole: z.string().trim().min(2),
  jobDescription: z.string().trim().min(30),
  selectedTemplateId: z.string().trim().min(1).optional().default("minimalist-grid"),
});

export const createTemplateAnalysisSchema = z.object({
  targetRole: z.string().trim().min(2),
  jobDescription: z.string().trim().min(30),
  selectedTemplateId: z.string().trim().min(1).optional().default("minimalist-grid"),
  resumeText: z.string().trim().min(30),
});
