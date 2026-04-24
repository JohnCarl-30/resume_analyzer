/**
 * Unit Tests — DeepFocusWizard orchestration
 *
 * Feature: resume-editor-flow
 *
 * Tests:
 * 1. Back navigation from workspace restores step 4 (suggestions)
 * 2. URL `?analysis=` param triggers analysis restoration and jumps to workspace
 * 3. `handleGenerateAnalysis` transitions from step 3 to step 4 on success
 *
 * Validates: Requirements 6.3, 6.4
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import type { ResumeAnalysisResult } from "../../../editor/model/resume-analysis";

// ---------------------------------------------------------------------------
// Mock analysis-api to avoid real API calls
// ---------------------------------------------------------------------------
const {
  mockCreateResumeAnalysis,
  mockGetResumeAnalysis,
  mockGetResumeAnalysisSourceUrl,
  mockUpdateResumeAnalysis,
} = vi.hoisted(() => ({
  mockCreateResumeAnalysis: vi.fn(),
  mockGetResumeAnalysis: vi.fn(),
  mockGetResumeAnalysisSourceUrl: vi.fn(() => "http://localhost/source"),
  mockUpdateResumeAnalysis: vi.fn(),
}));

vi.mock("../../utils/analysis-api", () => ({
  createResumeAnalysis: mockCreateResumeAnalysis,
  getResumeAnalysis: mockGetResumeAnalysis,
  getResumeAnalysisSourceUrl: mockGetResumeAnalysisSourceUrl,
  updateResumeAnalysis: mockUpdateResumeAnalysis,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

// Mock AnalysisWorkspace to avoid complex rendering — just render a sentinel
vi.mock("../../../editor/views/analysis-workspace", () => ({
  AnalysisWorkspace: ({ onBack }: { onBack: () => void }) => (
    <div data-testid="analysis-workspace">
      <button type="button" onClick={onBack}>
        Back
      </button>
    </div>
  ),
}));

// Mock TemplateRealPreview to avoid image loading in jsdom
vi.mock("../../../templates/components/template-preview", () => ({
  TemplateRealPreview: ({ variantId }: { variantId: string }) => (
    <div data-testid={`template-preview-${variantId}`}>{variantId}</div>
  ),
}));

// Import AFTER mocks are set up
import { DeepFocusWizard } from "../deep-focus-wizard";

// ---------------------------------------------------------------------------
// Shared fixture
// ---------------------------------------------------------------------------

const minimalAnalysisResult: ResumeAnalysisResult = {
  id: "test-analysis-123",
  targetRole: "Software Engineer",
  jobDescription: "We are looking for a software engineer with TypeScript experience.",
  selectedTemplateId: "minimalist-grid",
  score: 80,
  metricsFound: 2,
  matchedKeywords: ["TypeScript", "React"],
  missingKeywords: ["GraphQL"],
  suggestions: [
    {
      id: "s1",
      title: "Add metrics",
      detail: "Quantify your impact with numbers.",
      severity: "high",
      category: "impact",
    },
  ],
  generatedAt: new Date().toISOString(),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if the step pill text is present in the DOM (at least once). */
function hasStepPill(text: string): boolean {
  return screen.getAllByText(text).length > 0;
}

/** Fill in target role and job description, then advance to upload step. */
async function advanceToStep2() {
  const targetRoleInput = screen.getByPlaceholderText(/senior frontend engineer/i);
  fireEvent.change(targetRoleInput, {
    target: { value: "Software Engineer" },
  });
  const targetRoleNext = screen.getByRole("button", { name: /next: job details/i });
  fireEvent.click(targetRoleNext);

  const textarea = screen.getByRole("textbox");
  fireEvent.change(textarea, {
    target: { value: "We need a senior TypeScript engineer with React experience." },
  });
  const continueBtn = screen.getByRole("button", { name: /continue to resume upload/i });
  fireEvent.click(continueBtn);
}

/** Upload a PDF file and advance to template step. */
async function advanceToStep3() {
  await advanceToStep2();

  // Find the hidden file input and simulate a file selection
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  const pdfFile = new File(["pdf content"], "resume.pdf", { type: "application/pdf" });
  Object.defineProperty(fileInput, "files", { value: [pdfFile], configurable: true });
  fireEvent.change(fileInput);

  const continueBtn = screen.getByRole("button", { name: /continue to templates/i });
  fireEvent.click(continueBtn);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DeepFocusWizard unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset URL to no params
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

  // -------------------------------------------------------------------------
  // Test 1: Back navigation from workspace restores suggestions step
  // Validates: Requirement 6.3
  // -------------------------------------------------------------------------
  describe("Back navigation from workspace restores suggestions step", () => {
    it("shows step 5 (STEP 5 OF 5) after clicking Back from the workspace", async () => {
      mockCreateResumeAnalysis.mockResolvedValue(minimalAnalysisResult);

      render(<DeepFocusWizard />);

      // Navigate to step 3
      await advanceToStep3();

      // Template step is shown — click "Generate Analysis"
      expect(hasStepPill("STEP 4 OF 5")).toBe(true);
      const generateBtn = screen.getByRole("button", { name: /generate analysis/i });
      fireEvent.click(generateBtn);

      // Wait for the API call to resolve and suggestions step to appear
      await waitFor(() => {
        expect(hasStepPill("STEP 5 OF 5")).toBe(true);
      });

      // Click "Enter Editor" to go to workspace
      const enterEditorBtn = screen.getByRole("button", { name: /enter editor/i });
      fireEvent.click(enterEditorBtn);

      // Workspace should be shown
      await waitFor(() => {
        expect(screen.getByTestId("analysis-workspace")).toBeTruthy();
      });

      // Click Back from workspace
      const backBtn = screen.getByRole("button", { name: /back/i });
      fireEvent.click(backBtn);

      // Should be back on suggestions step
      await waitFor(() => {
        expect(hasStepPill("STEP 5 OF 5")).toBe(true);
      });
    });
  });

  describe("initialAnalysisId triggers analysis restoration", () => {
    it("shows workspace when initialAnalysisId is present and getResumeAnalysis succeeds", async () => {
      mockGetResumeAnalysis.mockResolvedValue(minimalAnalysisResult);
      render(<DeepFocusWizard initialAnalysisId="test-analysis-123" />);

      // The wizard should call getResumeAnalysis and transition to workspace
      await waitFor(() => {
        expect(mockGetResumeAnalysis).toHaveBeenCalledWith("test-analysis-123");
      });

      await waitFor(() => {
        expect(screen.getByTestId("analysis-workspace")).toBeTruthy();
      });
    });

    it("resets to step 1 when getResumeAnalysis fails", async () => {
      mockGetResumeAnalysis.mockRejectedValue(new Error("Not found"));
      render(<DeepFocusWizard initialAnalysisId="bad-id" />);

      await waitFor(() => {
        expect(mockGetResumeAnalysis).toHaveBeenCalledWith("bad-id");
      });

      // On failure, wizard resets to step 1
      await waitFor(() => {
        expect(hasStepPill("STEP 1 OF 5")).toBe(true);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Test 3: handleGenerateAnalysis transitions template -> suggestions on success
  // Validates: Requirement 6.3
  // -------------------------------------------------------------------------
  describe("handleGenerateAnalysis transitions step 4 -> step 5 on success", () => {
    it("shows step 5 (STEP 5 OF 5) after Generate Analysis succeeds", async () => {
      mockCreateResumeAnalysis.mockResolvedValue(minimalAnalysisResult);

      render(<DeepFocusWizard />);

      // Navigate to step 3
      await advanceToStep3();

      // Confirm we are on template step
      expect(hasStepPill("STEP 4 OF 5")).toBe(true);

      // Click "Generate Analysis"
      const generateBtn = screen.getByRole("button", { name: /generate analysis/i });
      fireEvent.click(generateBtn);

      // Wait for suggestions step to appear
      await waitFor(() => {
        expect(hasStepPill("STEP 5 OF 5")).toBe(true);
      });

      // Verify the API was called
      expect(mockCreateResumeAnalysis).toHaveBeenCalledTimes(1);
    });

    it("stays on template step and shows error when Generate Analysis fails", async () => {
      mockCreateResumeAnalysis.mockRejectedValue(new Error("Server error"));

      render(<DeepFocusWizard />);

      await advanceToStep3();

      const generateBtn = screen.getByRole("button", { name: /generate analysis/i });
      fireEvent.click(generateBtn);

      // Should remain on template step with an error message
      await waitFor(() => {
        expect(hasStepPill("STEP 4 OF 5")).toBe(true);
        expect(screen.getByText("Server error")).toBeTruthy();
      });
    });
  });
});
