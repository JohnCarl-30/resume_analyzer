import { integer, jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

import type { AnalysisSuggestion } from "../types/analysis.js";
import type { ExtractedResumeProfile } from "../types/resume-extraction.js";

export const databaseTables = {
  resumes: "resumes",
  resumeChunks: "resume_chunks",
  resumeAnalyses: "resume_analyses",
  analysisJobs: "analysis_jobs",
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
