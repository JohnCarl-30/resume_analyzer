export type AnalysisSeverity = "low" | "medium" | "high";

export type AnalysisCategory = "keywords" | "writing" | "impact";

import type { ExtractedResumeProfile } from "./resume-extraction";

export interface AnalysisSuggestion {
  id: string;
  title: string;
  detail: string;
  severity: AnalysisSeverity;
  category: AnalysisCategory;
}

export interface ScoreBreakdown {
  jobWords: number;
  mustHaves: number;
  clarity: number;
}

export interface ResumeAnalysisResult {
  id?: string;
  targetRole: string;
  jobDescription?: string;
  selectedTemplateId?: string;
  parsedResumeText?: string;
  score: number;
  scoreBreakdown?: ScoreBreakdown;
  metricsFound: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: AnalysisSuggestion[];
  generatedAt: string;
  sourceFileName?: string;
  sourceFileContentType?: string;
  extractedCharacterCount?: number;
  extractedProfile?: ExtractedResumeProfile | null;
  extractionProvider?: "parser" | "openai";
  createdAt?: string;
}
