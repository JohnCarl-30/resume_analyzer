/**
 * Unit Tests — Task 7.7: Simplified AnalysisWorkspace
 *
 * Tests:
 * 1. Download button present in header
 * 2. Source download button disabled when no source URL
 * 3. "Check again" button present
 * 4. Loading overlay shown when isUpdatingAnalysis=true
 * 5. Error shown in tailor modal on failure
 * 6. Right suggestions column is absent from the rendered output
 *
 * Validates: Requirements 5.1, 5.2, 7.1, 7.2, 7.3, 8.1, 8.2, 8.4, 8.5
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import type { ResumeTemplateVariant } from "../../../templates/model/template";
import { emptyResumeForm, type ResumeForm } from "../../model/resume-form";
import type { ResumeAnalysisResult } from "../../model/resume-analysis";

const { mockTailorResumeDraft } = vi.hoisted(() => ({
  mockTailorResumeDraft: vi.fn().mockResolvedValue({
    summary: { before: "Experienced engineer", after: "Software engineer with React and GraphQL experience." },
    skills: { before: "React, TypeScript", after: "React, TypeScript, GraphQL" },
    experience: [],
  }),
}));

// ---------------------------------------------------------------------------
// Mock ResumeRenderer to avoid rendering complexity in jsdom
// ---------------------------------------------------------------------------
vi.mock("../../components/resume-renderer", () => ({
  ResumeRenderer: ({
    variantId,
    showPlaceholders,
  }: {
    variantId: ResumeTemplateVariant;
    form: ResumeForm;
    showPlaceholders?: boolean;
  }) => (
    <div
      data-testid="resume-renderer"
      data-variant-id={variantId}
      data-show-placeholders={String(Boolean(showPlaceholders))}
    />
  ),
}));

vi.mock("../../lib/tailor-api", () => ({
  tailorResumeDraft: mockTailorResumeDraft,
}));

// Mock TemplateRealPreview to avoid image loading issues in jsdom
vi.mock("../../../templates/components/template-preview", () => ({
  TemplateRealPreview: ({ variantId }: { variantId: string }) => (
    <div data-testid={`template-preview-${variantId}`}>{variantId}</div>
  ),
}));

// Mock the analysis-api module (used via dynamic import in handleTailorToJob)
vi.mock("../../../onboarding/utils/analysis-api", () => ({
  updateResumeAnalysis: vi.fn(),
}));

// Import AFTER mocks are set up
import { AnalysisWorkspace } from "../analysis-workspace";
import * as analysisApi from "../../../onboarding/utils/analysis-api";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const minimalAnalysisResult: ResumeAnalysisResult = {
  id: "test-analysis-unit",
  targetRole: "Software Engineer",
  jobDescription: "We are looking for a software engineer with React and TypeScript experience.",
  score: 72,
  metricsFound: 3,
  matchedKeywords: ["React", "TypeScript"],
  missingKeywords: ["GraphQL"],
  suggestions: [
    {
      id: "s1",
      title: "Add metrics",
      detail: "Quantify your impact",
      severity: "high",
      category: "impact",
    },
  ],
  generatedAt: new Date().toISOString(),
  extractedProfile: {
    fullName: "Jane Doe",
    email: "jane@example.com",
    phone: "555-0100",
    summary: "Experienced engineer",
    skills: ["React", "TypeScript"],
    education: [],
    experience: [],
    leadership: [],
    projects: [],
    awards: [],
  },
};

function renderWorkspace(overrides: {
  resumeSourceUrl?: string | null;
  analysisResult?: ResumeAnalysisResult | null;
  initialForm?: ResumeForm;
  initialSuggestionsReviewOpen?: boolean;
} = {}) {
  return render(
    <AnalysisWorkspace
      targetRole="Software Engineer"
      selectedTemplateId="minimalist-grid"
      resumeFileName="resume.pdf"
      resumeSourceUrl={overrides.resumeSourceUrl ?? null}
      resumePreviewUrl={null}
      analysisResult={overrides.analysisResult !== undefined ? overrides.analysisResult : minimalAnalysisResult}
      initialForm={overrides.initialForm}
      initialSuggestionsReviewOpen={overrides.initialSuggestionsReviewOpen}
      onBack={vi.fn()}
    />,
  );
}

function checklistStep(title: string) {
  const titleNode = screen.getByText(title);
  const stepBody = titleNode.parentElement;
  if (!stepBody) {
    throw new Error(`Checklist step not found: ${title}`);
  }
  return stepBody;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AnalysisWorkspace — unit tests (task 7.7)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockTailorResumeDraft.mockResolvedValue({
      summary: { before: "Experienced engineer", after: "Software engineer with React and GraphQL experience." },
      skills: { before: "React, TypeScript", after: "React, TypeScript, GraphQL" },
      experience: [],
    });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  // -------------------------------------------------------------------------
  // Test 1: Download button present in header
  // Validates: Requirements 7.1
  // -------------------------------------------------------------------------
  it("renders a download button in the header", () => {
    const { container } = renderWorkspace();

    // The header download button has friendly visible text.
    // (the floating toolbar button only has an aria-label, no visible text)
    const header = container.querySelector("header");
    expect(header).not.toBeNull();
    const downloadButton = Array.from(header!.querySelectorAll("button")).find(
      (btn) => /backup copy|download original/i.test(btn.textContent ?? ""),
    );
    expect(downloadButton).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // Test 2: Source download button disabled when no source URL
  // Validates: Requirements 7.3
  // -------------------------------------------------------------------------
  it("renders the source download button as disabled when resumeSourceUrl is null", () => {
    const { container } = renderWorkspace({ resumeSourceUrl: null });

    const header = container.querySelector("header");
    expect(header).not.toBeNull();
    const downloadButton = Array.from(header!.querySelectorAll("button")).find(
      (btn) => /backup copy/i.test(btn.textContent ?? ""),
    );
    expect(downloadButton).toBeDefined();
    expect(downloadButton).toBeDisabled();
  });

  it("renders the download button as enabled with 'Download original' label when resumeSourceUrl is provided", () => {
    const { container } = renderWorkspace({ resumeSourceUrl: "https://example.com/resume.pdf" });

    const header = container.querySelector("header");
    expect(header).not.toBeNull();
    const downloadButton = Array.from(header!.querySelectorAll("button")).find(
      (btn) => /download original/i.test(btn.textContent ?? ""),
    );
    expect(downloadButton).toBeDefined();
    expect(downloadButton).not.toBeDisabled();
  });

  // -------------------------------------------------------------------------
  // Test 3: "Check again" button present
  // Validates: Requirements 8.1
  // -------------------------------------------------------------------------
  it("renders a 'Check again' button in the header", () => {
    renderWorkspace();

    const tailorButton = screen.getByRole("button", { name: /check resume again/i });
    expect(tailorButton).toBeInTheDocument();
  });

  it("renders plain-language next steps and opens the matching editor sections", () => {
    renderWorkspace({ initialForm: emptyResumeForm });

    expect(screen.getByText("Top fixes")).toBeInTheDocument();
    expect(screen.getByText("Getting close")).toBeInTheDocument();
    expect(screen.getByText("Add job words to Skills")).toBeInTheDocument();

    fireEvent.click(within(checklistStep("Add job words to Skills")).getByRole("button", { name: /edit section/i }));
    expect(screen.getByRole("heading", { name: /personal info/i })).toBeInTheDocument();
  });

  it("checklist experience and job-post actions open the right flows", async () => {
    const { unmount } = renderWorkspace({ initialForm: emptyResumeForm });

    fireEvent.click(within(checklistStep("Make work bullets clearer")).getByRole("button", { name: /edit section/i }));
    expect(screen.getByRole("heading", { name: /work experience/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Senior Product Designer")).toBeInTheDocument();

    unmount();
    renderWorkspace({ initialForm: emptyResumeForm });

    fireEvent.click(within(checklistStep("Check again with the job post")).getByRole("button", { name: /check job post/i }));
    expect(screen.getByRole("dialog", { name: /check a different job post/i })).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("dialog", { name: /check a different job post/i }), {
      key: "Escape",
      code: "Escape",
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /check a different job post/i })).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Test 4: Loading overlay shown when isUpdatingAnalysis=true
  // Validates: Requirements 8.4
  //
  // The loading overlay is shown when isUpdatingAnalysis state is true.
  // We trigger it by opening the tailor modal, entering a valid job post (≥30 chars),
  // and clicking "Check Resume" while updateResumeAnalysis returns a pending promise.
  // -------------------------------------------------------------------------
  it("shows a loading overlay while re-analysis is in progress", async () => {
    // Return a promise that never resolves so isUpdatingAnalysis stays true
    const neverResolves = new Promise<ResumeAnalysisResult>(() => {});
    vi.mocked(analysisApi.updateResumeAnalysis).mockReturnValue(neverResolves);

    renderWorkspace();

    // Open the tailor modal
    const tailorButton = screen.getByRole("button", { name: /check resume again/i });
    fireEvent.click(tailorButton);

    // The modal should be open — fill in a valid job post (≥30 chars)
    const textarea = screen.getByPlaceholderText(/paste the full job post here/i);
    fireEvent.change(textarea, {
      target: { value: "We need a senior software engineer with React and TypeScript skills." },
    });

    // Click "Check Resume" to trigger handleTailorToJob
    const updateButton = screen.getByRole("button", { name: /check resume/i });
    fireEvent.click(updateButton);

    // The loading overlay should now be visible (may sit under an open dialog's aria-hidden tree)
    await waitFor(() => {
      const status = document.querySelector('[role="status"][aria-busy="true"]');
      expect(status).not.toBeNull();
      expect(status).toHaveAttribute("aria-label", expect.stringMatching(/re-checking your resume/i));
      expect(status).toHaveTextContent(/analyzing/i);
      expect(document.querySelector('[role="progressbar"]')).not.toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Test 5: Error shown in tailor modal on failure
  // Validates: Requirements 8.5
  // -------------------------------------------------------------------------
  it("shows an error message inside the tailor modal when re-analysis fails", async () => {
    const errorMessage = "Failed to re-analyze resume.";
    vi.mocked(analysisApi.updateResumeAnalysis).mockRejectedValue(new Error(errorMessage));

    renderWorkspace();

    // Open the tailor modal
    const tailorButton = screen.getByRole("button", { name: /check resume again/i });
    fireEvent.click(tailorButton);

    // Fill in a valid job post
    const textarea = screen.getByPlaceholderText(/paste the full job post here/i);
    fireEvent.change(textarea, {
      target: { value: "We need a senior software engineer with React and TypeScript skills." },
    });

    // Submit
    const updateButton = screen.getByRole("button", { name: /check resume/i });
    fireEvent.click(updateButton);

    // Error message should appear inside the modal
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // The modal should still be open (previous analysis preserved)
    expect(screen.getByPlaceholderText(/paste the full job post here/i)).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Test 6: Right suggestions column is absent from the rendered output
  // Validates: Requirements 5.1, 5.2
  //
  // The simplified workspace has no right-side suggestions column.
  // The xl:grid-cols-[minmax(0,1fr)_22rem] class should NOT be present.
  // -------------------------------------------------------------------------
  it("does not render the right-side suggestions column (xl:grid-cols-[minmax(0,1fr)_22rem] class absent)", () => {
    const { container } = renderWorkspace();

    // The two-column grid class that was used for the suggestions column should not exist
    const twoColGrid = container.querySelector(".xl\\:grid-cols-\\[minmax\\(0\\,1fr\\)_22rem\\]");
    expect(twoColGrid).toBeNull();
  });

  it("does not render suggestion card elements in the workspace body", () => {
    renderWorkspace();

    // Suggestion cards from the analysis result should not appear in the workspace body
    // (they belong to StepSuggestions, not the workspace)
    // The suggestion title "Add metrics" should not be visible outside a modal
    expect(screen.queryByText("Add metrics")).not.toBeInTheDocument();
  });
});

describe("AnalysisWorkspace — tailor review flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockTailorResumeDraft.mockResolvedValue({
      summary: { before: "Experienced engineer", after: "Software engineer with React and GraphQL experience." },
      skills: { before: "React, TypeScript", after: "React, TypeScript, GraphQL" },
      experience: [],
    });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it("auto-opens the tailor review modal when initialSuggestionsReviewOpen is true", async () => {
    renderWorkspace({ initialSuggestionsReviewOpen: true });

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: /review job-tailored edits/i })).toBeInTheDocument();
    });
  });

  it("does not auto-open the tailor review modal when the review was dismissed", async () => {
    sessionStorage.setItem("analysis-review-dismissed:test-analysis-unit", "1");

    renderWorkspace({ initialSuggestionsReviewOpen: true });

    await waitFor(() => {
      expect(mockTailorResumeDraft).toHaveBeenCalled();
    });

    expect(screen.queryByRole("dialog", { name: /review job-tailored edits/i })).not.toBeInTheDocument();
  });

  it("shows a sidebar banner and header action for job-tailored edits", async () => {
    renderWorkspace({ initialForm: emptyResumeForm });

    await waitFor(() => {
      expect(screen.getByText("Job-tailored edits ready")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /review 2 edits/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /review job edits/i })).toBeInTheDocument();
  });

  it("opens the tailor review modal from the header action", async () => {
    renderWorkspace({ initialSuggestionsReviewOpen: false });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /review job edits/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /review job edits/i }));

    expect(screen.getByRole("dialog", { name: /review job-tailored edits/i })).toBeInTheDocument();
  });

  it("hides manual Add suggestion buttons while tailor proposals are available", async () => {
    renderWorkspace({ initialForm: emptyResumeForm });

    await waitFor(() => {
      expect(screen.getByText("Job-tailored edits ready")).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: /add suggestion for add job words to skills/i })).not.toBeInTheDocument();
    expect(
      within(checklistStep("Add job words to Skills")).getByRole("button", { name: /edit section/i }),
    ).toBeInTheDocument();
  });

  it("passes showPlaceholders to the layout preview when summary and skills are empty", async () => {
    renderWorkspace({ initialForm: emptyResumeForm });

    await waitFor(() => {
      expect(screen.getByTestId("resume-renderer")).toHaveAttribute("data-show-placeholders", "true");
    });
  });

  it("does not pass showPlaceholders when summary and skills are already filled", async () => {
    renderWorkspace();

    await waitFor(() => {
      expect(screen.getByTestId("resume-renderer")).toHaveAttribute("data-show-placeholders", "false");
    });
  });

  it("falls back to Review suggestions when tailor returns no proposals", async () => {
    mockTailorResumeDraft.mockResolvedValue({
      summary: { before: "Same", after: "Same" },
      skills: { before: "React", after: "React" },
      experience: [],
    });

    renderWorkspace({ initialForm: emptyResumeForm, initialSuggestionsReviewOpen: false });

    await waitFor(() => {
      expect(mockTailorResumeDraft).toHaveBeenCalled();
    });

    expect(screen.queryByText("Job-tailored edits ready")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /review suggestions/i })).toBeInTheDocument();
  });
});
