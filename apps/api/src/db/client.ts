import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import { env } from "../config/env.js";
import { databaseTables, resumeAnalysesTable } from "./schema.js";

type AppDatabase = NeonHttpDatabase<{
  resumeAnalysesTable: typeof resumeAnalysesTable;
}>;

const neonClient = env.DATABASE_URL ? neon(env.DATABASE_URL) : null;
const drizzleClient = neonClient
  ? drizzle(neonClient, {
      schema: {
        resumeAnalysesTable,
      },
    })
  : null;

let schemaReadyPromise: Promise<void> | null = null;

async function ensureSchema() {
  if (!drizzleClient) {
    return;
  }

  if (!schemaReadyPromise) {
    schemaReadyPromise = drizzleClient
      .execute(sql`
        CREATE TABLE IF NOT EXISTS ${sql.raw(databaseTables.resumeAnalyses)} (
          id text PRIMARY KEY,
          target_role text NOT NULL,
          selected_template_id text NOT NULL,
          job_description text NOT NULL,
          parsed_resume_text text NOT NULL,
          source_file_name text,
          source_file_content_type text,
          source_file_data_base64 text,
          extracted_character_count integer,
          extraction_provider text,
          score integer NOT NULL,
          matched_keywords jsonb NOT NULL,
          missing_keywords jsonb NOT NULL,
          suggestions jsonb NOT NULL,
          extracted_profile jsonb,
          generated_at timestamptz NOT NULL,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `)
      .then(() =>
        drizzleClient.execute(sql`
          ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
          ADD COLUMN IF NOT EXISTS source_file_content_type text
        `),
      )
      .then(() =>
        drizzleClient.execute(sql`
          ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
          ADD COLUMN IF NOT EXISTS source_file_data_base64 text
        `),
      )
      .then(() => undefined);
  }

  await schemaReadyPromise;
}

export interface DatabaseClient {
  kind: "drizzle";
  isConfigured: boolean;
  client: AppDatabase | null;
  ensureSchema: () => Promise<void>;
}

export const db: DatabaseClient = {
  kind: "drizzle",
  isConfigured: Boolean(drizzleClient),
  client: drizzleClient,
  ensureSchema,
};
