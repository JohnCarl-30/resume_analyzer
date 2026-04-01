import { z } from "zod";

export const createResumeSchema = z.object({
  fileName: z.string().min(1),
  storageKey: z.string().min(1),
  candidateName: z.string().min(1),
  status: z.enum(["uploaded", "processing", "analyzed"]).default("uploaded"),
});

export const analyzeResumeSchema = z.object({
  jobDescription: z.string().min(1),
  promptVersion: z.string().min(1).default("v1"),
});
