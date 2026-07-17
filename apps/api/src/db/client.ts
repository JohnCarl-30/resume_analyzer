import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import { env } from "../config/env.js";
import { databaseTables, resumeAnalysesTable, accountAnalysisUsageTable } from "./schema.js";

type AppDatabase = NeonHttpDatabase<{
  resumeAnalysesTable: typeof resumeAnalysesTable;
  accountAnalysisUsageTable: typeof accountAnalysisUsageTable;
}>;

const neonClient = env.DATABASE_URL ? neon(env.DATABASE_URL) : null;
const drizzleClient = neonClient
  ? drizzle(neonClient, {
      schema: {
        resumeAnalysesTable,
        accountAnalysisUsageTable,
      },
    })
  : null;

// Run schema setup once at module load, not per-request
async function initializeSchema() {
  if (!drizzleClient) {
    return;
  }

  try {
    await drizzleClient.execute(sql`
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
        metrics_found integer,
        matched_keywords jsonb NOT NULL,
        missing_keywords jsonb NOT NULL,
        suggestions jsonb NOT NULL,
        extracted_profile jsonb,
        job_embedding jsonb,
        resume_embedding jsonb,
        pipeline_stages jsonb,
        evaluation_metrics jsonb,
        few_shot_examples_used integer,
        processing_time_ms integer,
        user_id text,
        generated_at timestamptz NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await drizzleClient.execute(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS source_file_content_type text
    `);

    await drizzleClient.execute(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS source_file_data_base64 text
    `);

    await drizzleClient.execute(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS metrics_found integer
    `);

    await drizzleClient.execute(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS user_id text
    `);

    await drizzleClient.execute(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS job_embedding jsonb
    `);

    await drizzleClient.execute(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS resume_embedding jsonb
    `);

    await drizzleClient.execute(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS pipeline_stages jsonb
    `);

    await drizzleClient.execute(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS evaluation_metrics jsonb
    `);

    await drizzleClient.execute(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS few_shot_examples_used integer
    `);

    await drizzleClient.execute(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS processing_time_ms integer
    `);

    await drizzleClient.execute(sql`
      CREATE TABLE IF NOT EXISTS ${sql.raw(databaseTables.accountAnalysisUsage)} (
        user_id text PRIMARY KEY,
        analysis_id text NOT NULL,
        redeemed_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await drizzleClient.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS resume_analyses_one_per_user_idx
      ON ${sql.raw(databaseTables.resumeAnalyses)} (user_id)
      WHERE user_id IS NOT NULL
    `);
  } catch (error) {
    console.error("[db] Schema initialization failed:", error);
  }
}

// Fire-and-forget schema initialization for modules that import db early.
void initializeSchema();

export async function ensureDatabaseSchema() {
  await initializeSchema();
}

export interface DatabaseClient {
  kind: "drizzle";
  isConfigured: boolean;
  client: AppDatabase | null;
}

export const db: DatabaseClient = {
  kind: "drizzle",
  isConfigured: Boolean(drizzleClient),
  client: drizzleClient,
};
