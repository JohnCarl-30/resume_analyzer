import { neon } from "@neondatabase/serverless";
import { sql, type SQL } from "drizzle-orm";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import { env } from "../config/env.js";
import { databaseTables, resumeAnalysesTable, accountAnalysisUsageTable, productEventsTable, jobApplicationsTable } from "./schema.js";

type AppDatabase = NeonHttpDatabase<{
  resumeAnalysesTable: typeof resumeAnalysesTable;
  accountAnalysisUsageTable: typeof accountAnalysisUsageTable;
  productEventsTable: typeof productEventsTable;
  jobApplicationsTable: typeof jobApplicationsTable;
}>;

const neonClient = env.DATABASE_URL ? neon(env.DATABASE_URL) : null;
const drizzleClient = neonClient
  ? drizzle(neonClient, {
      schema: {
        resumeAnalysesTable,
        accountAnalysisUsageTable,
        productEventsTable,
        jobApplicationsTable,
      },
    })
  : null;

/**
 * Postgres error codes raised when two sessions race the same CREATE.
 *
 * `IF NOT EXISTS` checks and creates in two non-atomic steps, so it is not safe
 * under concurrency. Production runs up to three container instances, each
 * booting this module, so the race is expected rather than exceptional.
 */
const concurrentDdlCodes = new Set([
  "42P07", // duplicate_table
  "42710", // duplicate_object
  "23505", // unique_violation on a system catalog index
]);

function isConcurrentDdlRace(error: unknown): boolean {
  const code = (error as { code?: unknown } | null)?.code;
  return typeof code === "string" && concurrentDdlCodes.has(code);
}

/**
 * Run one DDL statement, treating a lost creation race as success.
 *
 * Each statement is guarded individually on purpose: a single try around the
 * whole batch would abandon every later statement after one race, leaving the
 * schema half-built.
 */
async function runDdl(statement: SQL): Promise<void> {
  if (!drizzleClient) {
    return;
  }

  try {
    await drizzleClient.execute(statement);
  } catch (error) {
    if (isConcurrentDdlRace(error)) {
      // Another instance created it first. The object exists, which is all we
      // wanted, so carry on with the rest of the schema.
      return;
    }
    throw error;
  }
}

async function initializeSchema() {
  if (!drizzleClient) {
    return;
  }

  try {
    await runDdl(sql`
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

    await runDdl(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS source_file_content_type text
    `);

    await runDdl(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS source_file_data_base64 text
    `);

    await runDdl(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS metrics_found integer
    `);

    await runDdl(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS user_id text
    `);

    await runDdl(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS job_embedding jsonb
    `);

    await runDdl(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS resume_embedding jsonb
    `);

    await runDdl(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS pipeline_stages jsonb
    `);

    await runDdl(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS evaluation_metrics jsonb
    `);

    await runDdl(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS few_shot_examples_used integer
    `);

    await runDdl(sql`
      ALTER TABLE ${sql.raw(databaseTables.resumeAnalyses)}
      ADD COLUMN IF NOT EXISTS processing_time_ms integer
    `);

    await runDdl(sql`
      CREATE TABLE IF NOT EXISTS ${sql.raw(databaseTables.accountAnalysisUsage)} (
        user_id text PRIMARY KEY,
        analysis_id text NOT NULL,
        redeemed_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await runDdl(sql`
      CREATE TABLE IF NOT EXISTS ${sql.raw(databaseTables.productEvents)} (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        analysis_id text,
        name text NOT NULL,
        metadata jsonb,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    await runDdl(sql`
      CREATE INDEX IF NOT EXISTS product_events_user_name_idx
      ON ${sql.raw(databaseTables.productEvents)} (user_id, name)
    `);

    await runDdl(sql`
      CREATE TABLE IF NOT EXISTS ${sql.raw(databaseTables.jobApplications)} (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        company text NOT NULL,
        role text NOT NULL,
        status text NOT NULL,
        location text,
        job_url text,
        notes text,
        applied_at text,
        analysis_id text,
        created_at text NOT NULL,
        updated_at text NOT NULL
      )
    `);

    await runDdl(sql`
      CREATE INDEX IF NOT EXISTS job_applications_user_updated_idx
      ON ${sql.raw(databaseTables.jobApplications)} (user_id, updated_at)
    `);

    await runDdl(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS resume_analyses_one_per_user_idx
      ON ${sql.raw(databaseTables.resumeAnalyses)} (user_id)
      WHERE user_id IS NOT NULL
    `);
  } catch (error) {
    console.error("[db] Schema initialization failed:", error);
  }
}

/**
 * Schema setup runs once per process.
 *
 * Both the eager call below and ensureDatabaseSchema await the same promise;
 * previously they each started their own run, so every boot executed the whole
 * schema twice concurrently and raced itself.
 */
let schemaInitialization: Promise<void> | null = null;

function initializeSchemaOnce(): Promise<void> {
  schemaInitialization ??= initializeSchema();
  return schemaInitialization;
}

// Fire-and-forget schema initialization for modules that import db early.
void initializeSchemaOnce();

export async function ensureDatabaseSchema() {
  await initializeSchemaOnce();
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
