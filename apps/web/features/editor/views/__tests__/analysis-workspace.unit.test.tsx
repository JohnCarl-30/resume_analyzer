/**
 * Unit Tests — Task 7.7: Simplified AnalysisWorkspace
 *
 * Tests:
 * 1. Download button present in header
 * 2. Download button disabled with "Export PDF" label when no source URL
 * 3. "Tailor to Job" button present
 * 4. Loading overlay shown when isUpdatingAnalysis=true
 * 5. Error shown in tailor modal on failure
 * 6. Right suggestions column is absent from the rendered output
 *
 * Validates: Requirements 5.1, 5.2, 7.1, 7.2, 7.3, 8.1, 8.2, 8.4, 8.5
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { ResumeTemplateVariant } from "../../../templates/model/template";
import type { ResumeForm } from "../../model/resume-form";
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
} = {}) {
  return render(
    <AnalysisWorkspace
      targetRole="Software Engineer"
      selectedTemplateId="minimalist-grid"
      resumeFileName="resume.pdf"
      resumeSourceUrl={overrides.resumeSourceUrl ?? null}
      resumePreviewUrl={null}
      analysisResult={overrides.analysisResult !== undefined ? overrides.analysisResult : minimalAnalysisResult}
      onBack={vi.fn()}
    />,
  );
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

    // The header download button has visible text "Export PDF" or "Download Source"
    // (the floating toolbar button only has an aria-label, no visible text)
    const header = container.querySelector("header");
    expect(header).not.toBeNull();
    const downloadButton = Array.from(header!.querySelectorAll("button")).find(
      (btn) => /export pdf|download source/i.test(btn.textContent ?? ""),
    );
    expect(downloadButton).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // Test 2: Download button disabled with "Export PDF" label when no source URL
  // Validates: Requirements 7.3
  // -------------------------------------------------------------------------
  it("renders the download button as disabled with 'Export PDF' label when resumeSourceUrl is null", () => {
    const { container } = renderWorkspace({ resumeSourceUrl: null });

    const header = container.querySelector("header");
    expect(header).not.toBeNull();
    const downloadButton = Array.from(header!.querySelectorAll("button")).find(
      (btn) => /export pdf/i.test(btn.textContent ?? ""),
    );
    expect(downloadButton).toBeDefined();
    expect(downloadButton).toBeDisabled();
  });

  it("renders the download button as enabled with 'Download Source' label when resumeSourceUrl is provided", () => {
    const { container } = renderWorkspace({ resumeSourceUrl: "https://example.com/resume.pdf" });

    const header = container.querySelector("header");
    expect(header).not.toBeNull();
    const downloadButton = Array.from(header!.querySelectorAll("button")).find(
      (btn) => /download source/i.test(btn.textContent ?? ""),
    );
    expect(downloadButton).toBeDefined();
    expect(downloadButton).not.toBeDisabled();
  });

  // -------------------------------------------------------------------------
  // Test 3: "Tailor to Job" button present
  // Validates: Requirements 8.1
  // -------------------------------------------------------------------------
  it("renders a 'Tailor to Job' button in the header", () => {
    renderWorkspace();

    const tailorButton = screen.getByRole("button", { name: /tailor to job/i });
    expect(tailorButton).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Test 4: Loading overlay shown when isUpdatingAnalysis=true
  // Validates: Requirements 8.4
  //
  // The loading overlay is shown when isUpdatingAnalysis state is true.
  // We trigger it by opening the tailor modal, entering a valid JD (≥30 chars),
  // and clicking "Update Analysis" while updateResumeAnalysis returns a pending promise.
  // -------------------------------------------------------------------------
  it("shows a loading overlay while re-analysis is in progress", async () => {
    // Return a promise that never resolves so isUpdatingAnalysis stays true
    const neverResolves = new Promise<ResumeAnalysisResult>(() => {});
    vi.mocked(analysisApi.updateResumeAnalysis).mockReturnValue(neverResolves);

    renderWorkspace();

    // Open the tailor modal
    const tailorButton = screen.getByRole("button", { name: /tailor to job/i });
    fireEvent.click(tailorButton);

    // The modal should be open — fill in a valid job description (≥30 chars)
    const textarea = screen.getByPlaceholderText(/paste the full job description here/i);
    fireEvent.change(textarea, {
      target: { value: "We need a senior software engineer with React and TypeScript skills." },
    });

    // Click "Update Analysis" to trigger handleTailorToJob
    const updateButton = screen.getByRole("button", { name: /update analysis/i });
    fireEvent.click(updateButton);

    // The loading overlay should now be visible
    await waitFor(() => {
      expect(screen.getByText(/tailoring analysis to new job/i)).toBeInTheDocument();
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
    const tailorButton = screen.getByRole("button", { name: /tailor to job/i });
    fireEvent.click(tailorButton);

    // Fill in a valid job description
    const textarea = screen.getByPlaceholderText(/paste the full job description here/i);
    fireEvent.change(textarea, {
      target: { value: "We need a senior software engineer with React and TypeScript skills." },
    });

    // Submit
    const updateButton = screen.getByRole("button", { name: /update analysis/i });
    fireEvent.click(updateButton);

    // Error message should appear inside the modal
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // The modal should still be open (previous analysis preserved)
    expect(screen.getByPlaceholderText(/paste the full job description here/i)).toBeInTheDocument();
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
