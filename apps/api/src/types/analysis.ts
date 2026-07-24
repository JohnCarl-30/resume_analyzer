export type AnalysisSeverity = "low" | "medium" | "high";

export type AnalysisCategory = "keywords" | "writing" | "impact";

import type { ExtractedResumeProfile } from "./resume-extraction.js";

export interface AnalysisSuggestion {
  id: string;
  title: string;
  detail: string;
  severity: AnalysisSeverity;
  category: AnalysisCategory;
}

export interface ScoreBreakdown {
  /** 0–100 job-word alignment */
  jobWords: number;
  /** 0–100 required-skills hit rate */
  mustHaves: number;
  /** 0–100 writing / structure / impact clarity */
  clarity: number;
}

export interface ResumeAnalysis {
  id?: string;
  targetRole: string;
  jobDescription?: string;
  selectedTemplateId?: string;
  score: number;
  scoreBreakdown?: ScoreBreakdown;
  metricsFound?: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: AnalysisSuggestion[];
  generatedAt: string;
  sourceFileName?: string;
  sourceFileContentType?: string;
  extractedCharacterCount?: number;
  extractedProfile?: ExtractedResumeProfile | null;
  extractionProvider?: "parser" | "openai";
  // AI Pipeline fields
  jobEmbedding?: number[] | null;
  resumeEmbedding?: number[] | null;
  pipelineStages?: Array<{ name: string; status: string; duration?: number; error?: string }> | null;
  evaluationMetrics?: Record<string, unknown> | null;
  fewShotExamplesUsed?: number | null;
  processingTimeMs?: number | null;
}
