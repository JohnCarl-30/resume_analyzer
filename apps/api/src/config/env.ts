import "dotenv/config";

import { z } from "zod";

const optionalString = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().min(1).optional());

const optionalUrl = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? undefined : trimmed;
}, z.string().url().optional());

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  APP_ORIGIN: z.string().url().default("http://localhost:3000"),
  DATABASE_URL: optionalString,
  AI_EXTRACTION_MODEL: z.string().min(1).default("gpt-4o-mini"),
  OPENAI_API_KEY: optionalString,
  CLERK_SECRET_KEY: optionalString,
  R2_BUCKET_NAME: optionalString,
  R2_PUBLIC_BASE_URL: optionalUrl,
  R2_ACCOUNT_ID: optionalString,
  R2_ACCESS_KEY_ID: optionalString,
  R2_SECRET_ACCESS_KEY: optionalString,
  SENTRY_DSN: optionalString,
  SENTRY_ENVIRONMENT: optionalString,
});

export const env = envSchema.parse(process.env);

export function isR2Configured(): boolean {
  return Boolean(
    env.R2_BUCKET_NAME &&
      env.R2_ACCOUNT_ID &&
      env.R2_ACCESS_KEY_ID &&
      env.R2_SECRET_ACCESS_KEY,
  );
}
