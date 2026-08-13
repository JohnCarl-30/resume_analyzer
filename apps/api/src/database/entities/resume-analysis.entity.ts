import { Column, Entity, Index, PrimaryColumn } from "typeorm";

import type { AnalysisSuggestion } from "../../types/analysis.js";
import type { ExtractedResumeProfile } from "../../types/resume-extraction.js";

interface PipelineStage {
  name: string;
  status: string;
  duration?: number;
  error?: string;
}

/**
 * Embeddings are stored as jsonb arrays rather than a vector type; semantic
 * search reads them back and compares in application code.
 */
@Entity({ name: "resume_analyses" })
// Partial unique index: one saved analysis per signed-in user, while
// anonymous rows (user_id IS NULL) are unconstrained. The where clause must
// match Postgres's stored form exactly or TypeORM regenerates it every run.
@Index("resume_analyses_one_per_user_idx", ["userId"], {
  unique: true,
  where: "user_id IS NOT NULL",
})
export class ResumeAnalysisEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "target_role", type: "text" })
  targetRole!: string;

  @Column({ name: "selected_template_id", type: "text" })
  selectedTemplateId!: string;

  @Column({ name: "job_description", type: "text" })
  jobDescription!: string;

  @Column({ name: "parsed_resume_text", type: "text" })
  parsedResumeText!: string;

  @Column({ name: "source_file_name", type: "text", nullable: true })
  sourceFileName!: string | null;

  @Column({ name: "source_file_content_type", type: "text", nullable: true })
  sourceFileContentType!: string | null;

  @Column({ name: "source_file_data_base64", type: "text", nullable: true })
  sourceFileDataBase64!: string | null;

  @Column({ name: "extracted_character_count", type: "integer", nullable: true })
  extractedCharacterCount!: number | null;

  @Column({ name: "extraction_provider", type: "text", nullable: true })
  extractionProvider!: "parser" | "openai" | null;

  @Column({ type: "integer" })
  score!: number;

  @Column({ name: "metrics_found", type: "integer", nullable: true })
  metricsFound!: number | null;

  @Column({ name: "matched_keywords", type: "jsonb" })
  matchedKeywords!: string[];

  @Column({ name: "missing_keywords", type: "jsonb" })
  missingKeywords!: string[];

  @Column({ type: "jsonb" })
  suggestions!: AnalysisSuggestion[];

  @Column({ name: "extracted_profile", type: "jsonb", nullable: true })
  extractedProfile!: ExtractedResumeProfile | null;

  @Column({ name: "generated_at", type: "timestamptz" })
  generatedAt!: Date;

  @Column({ name: "created_at", type: "timestamptz", default: () => "now()" })
  createdAt!: Date;

  @Column({ name: "user_id", type: "text", nullable: true })
  userId!: string | null;

  @Column({ name: "job_embedding", type: "jsonb", nullable: true })
  jobEmbedding!: number[] | null;

  @Column({ name: "resume_embedding", type: "jsonb", nullable: true })
  resumeEmbedding!: number[] | null;

  @Column({ name: "pipeline_stages", type: "jsonb", nullable: true })
  pipelineStages!: PipelineStage[] | null;

  @Column({ name: "evaluation_metrics", type: "jsonb", nullable: true })
  evaluationMetrics!: Record<string, unknown> | null;

  @Column({ name: "few_shot_examples_used", type: "integer", nullable: true })
  fewShotExamplesUsed!: number | null;

  @Column({ name: "processing_time_ms", type: "integer", nullable: true })
  processingTimeMs!: number | null;
}
