export type AnalysisSeverity = "low" | "medium" | "high";

export type AnalysisCategory = "keywords" | "writing" | "impact";

export interface AnalysisSuggestion {
  id: string;
  title: string;
  detail: string;
  severity: AnalysisSeverity;
  category: AnalysisCategory;
}

export interface ResumeAnalysis {
  targetRole: string;
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: AnalysisSuggestion[];
  generatedAt: string;
}
