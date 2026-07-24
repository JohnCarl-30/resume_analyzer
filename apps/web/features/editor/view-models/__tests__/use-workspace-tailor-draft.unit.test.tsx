import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

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
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(tailorResumeDraft).mockClear();
  });

  it("does not fetch on mount until ensureDraft is called", async () => {
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

    expect(tailorResumeDraft).not.toHaveBeenCalled();
    expect(result.current.proposals).toHaveLength(0);

    await act(async () => {
      await result.current.ensureDraft();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(tailorResumeDraft).toHaveBeenCalled();
    expect(result.current.proposals).toHaveLength(2);

    act(() => {
      const summary = result.current.proposals.find((item) => item.id === "tailor-summary");
      expect(summary).toBeTruthy();
      result.current.approveProposal(summary!);
    });

    expect(result.current.previewForm.personalInfo.summary).toBe("New summary");
    expect(result.current.applyApprovedToForm().personalInfo.summary).toBe("New summary");
  });

  it("reuses a sessionStorage cache for the same analysis", async () => {
    const { result, rerender } = renderHook(() =>
      useWorkspaceTailorDraft({
        enabled: true,
        baseForm: emptyResumeForm,
        analysisResult,
        targetRole: "Frontend Engineer",
      }),
    );

    await act(async () => {
      await result.current.ensureDraft();
    });

    expect(tailorResumeDraft).toHaveBeenCalledTimes(1);

    rerender();

    await act(async () => {
      await result.current.ensureDraft();
    });

    expect(tailorResumeDraft).toHaveBeenCalledTimes(1);
  });
});
