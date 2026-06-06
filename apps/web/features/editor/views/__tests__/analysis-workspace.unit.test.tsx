/**
 * Unit Tests — Task 7.7: Simplified AnalysisWorkspace
 *
 * Tests:
 * 1. Download button present in header
 * 2. Source download button disabled when no source URL
 * 3. "Check Job Match" button present
 * 4. Loading overlay shown when isUpdatingAnalysis=true
 * 5. Error shown in tailor modal on failure
 * 6. Right suggestions column is absent from the rendered output
 *
 * Validates: Requirements 5.1, 5.2, 7.1, 7.2, 7.3, 8.1, 8.2, 8.4, 8.5
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import type { ResumeTemplateVariant } from "../../../templates/model/template";
import { emptyResumeForm, type ResumeForm } from "../../model/resume-form";
import type { ResumeAnalysisResult } from "../../model/resume-analysis";

// ---------------------------------------------------------------------------
// Mock ResumeRenderer to avoid rendering complexity in jsdom
// ---------------------------------------------------------------------------
vi.mock("../../components/resume-renderer", () => ({
  ResumeRenderer: ({ variantId }: { variantId: ResumeTemplateVariant; form: ResumeForm }) => (
    <div data-testid="resume-renderer" data-variant-id={variantId} />
  ),
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

  it("renders the download button as enabled with 'Download Original' label when resumeSourceUrl is provided", () => {
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
  // Test 3: "Check Job Match" button present
  // Validates: Requirements 8.1
  // -------------------------------------------------------------------------
  it("renders a 'Check Job Match' button in the header", () => {
    renderWorkspace();

    const tailorButton = screen.getByRole("button", { name: /check job match/i });
    expect(tailorButton).toBeInTheDocument();
  });

  it("renders plain-language ATS next steps and opens the matching editor sections", () => {
    renderWorkspace({ initialForm: emptyResumeForm });

    expect(screen.getByText("ATS checklist")).toBeInTheDocument();
    expect(screen.getByText("Getting close")).toBeInTheDocument();
    expect(screen.getByText("Add the right skills")).toBeInTheDocument();

    fireEvent.click(within(checklistStep("Add the right skills")).getByRole("button", { name: /fix this section/i }));
    expect(screen.getByRole("heading", { name: /personal info/i })).toBeInTheDocument();
  });

  it("checklist experience and job-post actions open the right flows", async () => {
    const { unmount } = renderWorkspace({ initialForm: emptyResumeForm });

    fireEvent.click(within(checklistStep("Fix your work bullets")).getByRole("button", { name: /fix this section/i }));
    expect(screen.getByRole("heading", { name: /work experience/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Senior Product Designer")).toBeInTheDocument();

    unmount();
    renderWorkspace({ initialForm: emptyResumeForm });

    fireEvent.click(within(checklistStep("Check against the job post")).getByRole("button", { name: /check job post/i }));
    expect(screen.getByRole("dialog", { name: /check another job post/i })).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("dialog", { name: /check another job post/i }), {
      key: "Escape",
      code: "Escape",
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: /check another job post/i })).not.toBeInTheDocument();
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
    const tailorButton = screen.getByRole("button", { name: /check job match/i });
    fireEvent.click(tailorButton);

    // The modal should be open — fill in a valid job post (≥30 chars)
    const textarea = screen.getByPlaceholderText(/paste the full job post here/i);
    fireEvent.change(textarea, {
      target: { value: "We need a senior software engineer with React and TypeScript skills." },
    });

    // Click "Check Resume" to trigger handleTailorToJob
    const updateButton = screen.getByRole("button", { name: /check resume/i });
    fireEvent.click(updateButton);

    // The loading overlay should now be visible
    await waitFor(() => {
      expect(screen.getByText(/checking your resume against the new job post/i)).toBeInTheDocument();
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
    const tailorButton = screen.getByRole("button", { name: /check job match/i });
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
