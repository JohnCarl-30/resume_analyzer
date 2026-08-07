import { z } from "zod";

import { JOB_APPLICATION_STATUSES } from "../types/job-application.js";

const optionalText = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().max(2000).optional());

const optionalUrl = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().url("Enter a valid URL.").optional());

const optionalDate = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().datetime({ offset: true }).optional());

export const createJobApplicationSchema = z.object({
  company: z.string().trim().min(1, "Company is required.").max(200),
  role: z.string().trim().min(1, "Role is required.").max(200),
  status: z.enum(JOB_APPLICATION_STATUSES).default("saved"),
  location: optionalText,
  jobUrl: optionalUrl,
  notes: optionalText,
  appliedAt: optionalDate,
  analysisId: optionalText,
});

export const updateJobApplicationSchema = createJobApplicationSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update.",
  });

export type CreateJobApplicationInput = z.infer<typeof createJobApplicationSchema>;
export type UpdateJobApplicationInput = z.infer<typeof updateJobApplicationSchema>;
