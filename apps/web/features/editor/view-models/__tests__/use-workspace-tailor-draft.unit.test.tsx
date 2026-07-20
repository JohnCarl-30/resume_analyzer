import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { emptyResumeForm } from "../../model/resume-form";
import type { ResumeAnalysisResult } from "../../model/resume-analysis";

vi.mock("../../lib/tailor-api", () => ({
  tailorResumeDraft: vi.fn().mockResolvedValue({
    summary: { before: "Old summary", after: "New summary" },
    skills: { before: "React", after: "React, accessibility" },
    experience: [],
  }),
}));

import { tailorResumeDraft } from "../../lib/tailor-api";
import { useWorkspaceTailorDraft } from "../use-workspace-tailor-draft";

const analysisResult: ResumeAnalysisResult = {
  id: "analysis-1",
  targetRole: "Frontend Engineer",
  jobDescription: "Looking for a frontend engineer with accessibility experience.",
  selectedTemplateId: "minimalist-grid",
  score: 72,
  metricsFound: 1,
  matchedKeywords: ["React"],
  missingKeywords: ["accessibility"],
  suggestions: [],
  generatedAt: new Date().toISOString(),
};

describe("useWorkspaceTailorDraft", () => {
  it("loads proposals and applies approved preview changes", async () => {
    const { result } = renderHook(() =>
      useWorkspaceTailorDraft({
        enabled: true,
        baseForm: {
          ...emptyResumeForm,
          personalInfo: {
            ...emptyResumeForm.personalInfo,
            summary: "Old summary",
            skills: "React",
          },
        },
        analysisResult,
        targetRole: "Frontend Engineer",
      }),
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(tailorResumeDraft).toHaveBeenCalled();
    expect(result.current.proposals).toHaveLength(2);

    act(() => {
      result.current.approveProposal("tailor-summary");
    });

    expect(result.current.previewForm.personalInfo.summary).toBe("New summary");
    expect(result.current.applyApprovedToForm().personalInfo.summary).toBe("New summary");
  });
});
