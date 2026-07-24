import { z } from "zod";

export const productEventNames = [
  "resume_print",
  "resume_export_json",
  "resume_download_original",
] as const;

export type ProductEventName = (typeof productEventNames)[number];

export const createProductEventSchema = z.object({
  name: z.enum(productEventNames),
  analysisId: z.string().trim().min(1).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateProductEventInput = z.infer<typeof createProductEventSchema>;
