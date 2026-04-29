import "dotenv/config";

import { z } from "zod";

const optionalString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().min(1).optional());

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  APP_ORIGIN: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: optionalString,
  GCP_PROJECT_ID: z.string().min(1).optional(),
  GCP_LOCATION: z.string().min(1).default("us-central1"),
  AI_EXTRACTION_MODEL: z.string().min(1).default("gemini-2.5-flash"),
  GOOGLE_APPLICATION_CREDENTIALS: optionalString,
  R2_BUCKET_NAME: z.string().min(1).optional(),
  R2_PUBLIC_BASE_URL: z.string().url().optional().or(z.literal("")),
});

export const env = envSchema.parse(process.env);
