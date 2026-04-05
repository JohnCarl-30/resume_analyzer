import { z } from "zod";

export const createAnalysisSchema = z.object({
  targetRole: z.string().trim().min(2),
  jobDescription: z.string().trim().min(30),
  resumeText: z.string().trim().min(30),
});

export const createUploadedAnalysisSchema = createAnalysisSchema.pick({
  targetRole: true,
  jobDescription: true,
});
