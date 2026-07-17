import { describe, expect, it } from "vitest";

import { emptyResumeForm } from "../../model/resume-form";
import type { ResumeAnalysisResult } from "../../model/resume-analysis";
import { getAnalysisNextStepsState } from "../analysis-next-steps";
import { buildAnalysisReviewItems } from "../analysis-review-items";

const baseAnalysis: ResumeAnalysisResult = {
  id: "analysis-1",
  targetRole: "Software Engineer Intern",
  score: 72,
  metricsFound: 0,
  matchedKeywords: ["React"],
  missingKeywords: ["Gemini", "Cursor", "Golang"],
  suggestions: [
    {
      id: "suggestion-1",
      title: "Include Missing Keywords",
      detail: "Add Gemini and Cursor to your skills section.",
      severity: "high",
      category: "keywords",
    },
  ],
  generatedAt: "2026-01-01T00:00:00.000Z",
};

describe("buildAnalysisReviewItems", () => {
  it("combines editable next steps and advisory suggestions", () => {
    const nextSteps = getAnalysisNextStepsState(emptyResumeForm, baseAnalysis, baseAnalysis.targetRole);
    const items = buildAnalysisReviewItems(baseAnalysis, nextSteps);

    expect(items.some((item) => item.kind === "editable" && item.action === "skills")).toBe(true);
    expect(items.some((item) => item.kind === "advisory" && item.title === "Include Missing Keywords")).toBe(
      true,
    );
  });
});
