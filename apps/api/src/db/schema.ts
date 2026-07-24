import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import type { AnalysisSuggestion } from "../types/analysis.js";
import type { ExtractedResumeProfile } from "../types/resume-extraction.js";

export const databaseTables = {
  resumes: "resumes",
  resumeChunks: "resume_chunks",
  resumeAnalyses: "resume_analyses",
  analysisJobs: "analysis_jobs",
  accountAnalysisUsage: "account_analysis_usage",
  productEvents: "product_events",
} as const;

export const resumeAnalysesTable = pgTable(databaseTables.resumeAnalyses, {
  id: text("id").primaryKey(),
  targetRole: text("target_role").notNull(),
  selectedTemplateId: text("selected_template_id").notNull(),
  jobDescription: text("job_description").notNull(),
  parsedResumeText: text("parsed_resume_text").notNull(),
  sourceFileName: text("source_file_name"),
  sourceFileContentType: text("source_file_content_type"),
  sourceFileDataBase64: text("source_file_data_base64"),
  extractedCharacterCount: integer("extracted_character_count"),
  extractionProvider: text("extraction_provider").$type<"parser" | "openai" | null>(),
  score: integer("score").notNull(),
  metricsFound: integer("metrics_found"),
  matchedKeywords: jsonb("matched_keywords").$type<string[]>().notNull(),
  missingKeywords: jsonb("missing_keywords").$type<string[]>().notNull(),
  suggestions: jsonb("suggestions").$type<AnalysisSuggestion[]>().notNull(),
  extractedProfile: jsonb("extracted_profile").$type<ExtractedResumeProfile | null>(),
  jobEmbedding: jsonb("job_embedding").$type<number[] | null>(),
  resumeEmbedding: jsonb("resume_embedding").$type<number[] | null>(),
  pipelineStages: jsonb("pipeline_stages").$type<Array<{ name: string; status: string; duration?: number; error?: string }> | null>(),
  evaluationMetrics: jsonb("evaluation_metrics").$type<Record<string, unknown> | null>(),
  fewShotExamplesUsed: integer("few_shot_examples_used"),
  processingTimeMs: integer("processing_time_ms"),
  userId: text("user_id"),
  generatedAt: timestamp("generated_at", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),
});

export const accountAnalysisUsageTable = pgTable(databaseTables.accountAnalysisUsage, {
  userId: text("user_id").primaryKey(),
  analysisId: text("analysis_id").notNull(),
  redeemedAt: timestamp("redeemed_at", {
    withTimezone: true,
    mode: "string",
  }).notNull(),
});

export const productEventsTable = pgTable(databaseTables.productEvents, {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  analysisId: text("analysis_id"),
  name: text("name").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),
});
