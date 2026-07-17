import type { AnalysisNextStepAction, AnalysisNextStepsState } from "./analysis-next-steps";
import type { AnalysisSuggestion, ResumeAnalysisResult } from "../model/resume-analysis";

export type ReviewSuggestionKind = "editable" | "advisory";

export interface ReviewSuggestionItem {
  id: string;
  title: string;
  description: string;
  proposedChange?: string;
  severity?: AnalysisSuggestion["severity"];
  kind: ReviewSuggestionKind;
  action?: AnalysisNextStepAction;
}

const severityRank: Record<AnalysisSuggestion["severity"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

export function buildAnalysisReviewItems(
  analysisResult: ResumeAnalysisResult,
  nextSteps: AnalysisNextStepsState,
): ReviewSuggestionItem[] {
  const items: ReviewSuggestionItem[] = [];

  for (const step of nextSteps.steps) {
    if (step.complete || !step.applyLabel || !step.action) {
      continue;
    }

    items.push({
      id: `step-${step.id}`,
      title: step.title,
      description: step.description,
      proposedChange: step.applyDescription,
      kind: "editable",
      action: step.action,
    });
  }

  const advisorySuggestions = [...analysisResult.suggestions]
    .sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
    .slice(0, 6);

  for (const suggestion of advisorySuggestions) {
    items.push({
      id: suggestion.id,
      title: suggestion.title,
      description: suggestion.detail,
      severity: suggestion.severity,
      kind: "advisory",
    });
  }

  return items;
}

export function getAnalysisReviewStorageKey(analysisId: string) {
  return `analysis-review-dismissed:${analysisId}`;
}

export function hasDismissedAnalysisReview(analysisId: string) {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(getAnalysisReviewStorageKey(analysisId)) === "1";
}

export function markAnalysisReviewDismissed(analysisId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(getAnalysisReviewStorageKey(analysisId), "1");
}
