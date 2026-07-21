/**
 * Unit Tests — AnalysisWizard orchestration
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
  mockLoadResumeAnalysisSourcePreview,
  mockUpdateResumeAnalysis,
  mockRouter,
  mockUseAnalysisQuota,
  mockUseSearchParams,
} = vi.hoisted(() => ({
  mockCreateResumeAnalysis: vi.fn(),
  mockGetResumeAnalysis: vi.fn(),
  mockLoadResumeAnalysisSourcePreview: vi.fn(() =>
    Promise.resolve({
      sourceUrl: "blob:http://localhost/source",
      previewUrl: "blob:http://localhost/source",
    }),
  ),
  mockUpdateResumeAnalysis: vi.fn(),
  mockRouter: {
    push: vi.fn(),
    replace: vi.fn(),
  },
  mockUseAnalysisQuota: vi.fn(() => ({
    quota: {
      limit: 1,
      used: 0,
      canAnalyze: true,
      analysisId: null,
      redeemedAt: null,
    },
    error: "",
    isLoading: false,
    refetch: vi.fn(),
  })),
  mockUseSearchParams: vi.fn(() => new URLSearchParams()),
}));

vi.mock("../../utils/analysis-api", () => ({
  createResumeAnalysis: mockCreateResumeAnalysis,
  getResumeAnalysis: mockGetResumeAnalysis,
  loadResumeAnalysisSourcePreview: mockLoadResumeAnalysisSourcePreview,
  updateResumeAnalysis: mockUpdateResumeAnalysis,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  useSearchParams: () => mockUseSearchParams(),
}));

vi.mock("@/features/account/view-models/use-analysis-quota", () => ({
  useAnalysisQuota: () => mockUseAnalysisQuota(),
}));

vi.mock("@clerk/nextjs", () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignOutButton: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    getToken: vi.fn(),
    signOut: vi.fn(),
  }),
  useUser: () => ({
    isLoaded: true,
    user: { fullName: "Alex Example", primaryEmailAddress: { emailAddress: "alex@example.com" } },
  }),
}));

// Mock AnalysisWorkspace to avoid complex rendering — just render a sentinel
vi.mock("../../../editor/views/analysis-workspace", () => ({
  AnalysisWorkspace: ({
    onBack,
    selectedTemplateId,
    initialSuggestionsReviewOpen,
  }: {
    onBack: () => void;
    selectedTemplateId: string;
    initialSuggestionsReviewOpen?: boolean;
  }) => (
    <div
      data-testid="analysis-workspace"
      data-selected-template-id={selectedTemplateId}
      data-initial-suggestions-review-open={String(Boolean(initialSuggestionsReviewOpen))}
    >
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
import { AnalysisWizard } from "../analysis-wizard";

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

/** Wait until quota loading finishes and wizard content is shown. */
async function waitForWizardReady() {
  await waitFor(() => {
    expect(screen.queryByText(/loading your account status/i)).not.toBeInTheDocument();
  });
}

/** Fill in target role and job description, then advance to upload step. */
async function advanceToStep2() {
  await waitForWizardReady();

  const targetRoleInput = screen.getByPlaceholderText(/senior frontend engineer/i);
  fireEvent.change(targetRoleInput, {
    target: { value: "Software Engineer" },
  });
  const targetRoleNext = screen.getByRole("button", { name: /next: paste job post/i });
  fireEvent.click(targetRoleNext);

  const textarea = screen.getByRole("textbox");
  fireEvent.change(textarea, {
    target: { value: "We need a senior TypeScript engineer with React experience." },
  });
  const continueBtn = screen.getByRole("button", { name: /next: add resume/i });
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

  const continueBtn = screen.getByRole("button", { name: /next: pick layout/i });
  fireEvent.click(continueBtn);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AnalysisWizard unit tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    mockUseAnalysisQuota.mockReturnValue({
      quota: {
        limit: 1,
        used: 0,
        canAnalyze: true,
        analysisId: null,
        redeemedAt: null,
      },
      error: "",
      isLoading: false,
      refetch: vi.fn(),
    });
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
  describe("Back navigation from workspace after a completed check", () => {
    it("returns home instead of the blocked upload step", async () => {
      mockCreateResumeAnalysis.mockResolvedValue(minimalAnalysisResult);

      render(<AnalysisWizard />);

      // Navigate to step 3
      await advanceToStep3();

      // Style step is shown — click "Check my resume"
      expect(hasStepPill("STEP 4 OF 5")).toBe(true);
      const generateBtn = screen.getByRole("button", { name: /check my resume/i });
      fireEvent.click(generateBtn);

      // Wait for workspace after analysis completes
      await waitFor(() => {
        expect(screen.getByTestId("analysis-workspace")).toBeTruthy();
      });

      // Click Back from workspace
      const backBtn = screen.getByRole("button", { name: /back/i });
      fireEvent.click(backBtn);

      // Free quota is used after a check — don't trap users on the upload step.
      expect(mockRouter.push).toHaveBeenCalledWith("/home");
    });
  });

  describe("initialAnalysisId triggers analysis restoration", () => {
    it("shows workspace when initialAnalysisId is present and getResumeAnalysis succeeds", async () => {
      mockGetResumeAnalysis.mockResolvedValue(minimalAnalysisResult);
      render(<AnalysisWizard initialAnalysisId="test-analysis-123" />);

      // The wizard should call getResumeAnalysis and transition to workspace
      await waitFor(() => {
        expect(mockGetResumeAnalysis).toHaveBeenCalledWith("test-analysis-123");
      });

      await waitFor(() => {
        expect(screen.getByTestId("analysis-workspace")).toBeTruthy();
      });

      expect(screen.getByTestId("analysis-workspace")).toHaveAttribute(
        "data-initial-suggestions-review-open",
        "false",
      );
      expect(mockLoadResumeAnalysisSourcePreview).not.toHaveBeenCalled();
    });

    it("resets to step 1 when getResumeAnalysis fails", async () => {
      mockGetResumeAnalysis.mockRejectedValue(new Error("Not found"));
      render(<AnalysisWizard initialAnalysisId="bad-id" />);

      await waitFor(() => {
        expect(mockGetResumeAnalysis).toHaveBeenCalledWith("bad-id");
      });

      // On failure, wizard resets to step 1
      await waitFor(() => {
        expect(hasStepPill("STEP 1 OF 5")).toBe(true);
      });
    });

    it("returns to home when Back is clicked from a restored saved check", async () => {
      mockGetResumeAnalysis.mockResolvedValue(minimalAnalysisResult);
      render(<AnalysisWizard initialAnalysisId="test-analysis-123" />);

      await waitFor(() => {
        expect(screen.getByTestId("analysis-workspace")).toBeTruthy();
      });

      fireEvent.click(screen.getByRole("button", { name: /back/i }));

      expect(mockRouter.push).toHaveBeenCalledWith("/home");
    });
  });

  // -------------------------------------------------------------------------
  // Test 3: handleGenerateAnalysis transitions template -> suggestions on success
  // Validates: Requirement 6.3
  // -------------------------------------------------------------------------
  describe("handleGenerateAnalysis transitions template -> workspace on success", () => {
    it("opens the workspace after Check my resume succeeds", async () => {
      mockCreateResumeAnalysis.mockResolvedValue(minimalAnalysisResult);

      render(<AnalysisWizard />);

      // Navigate to step 3
      await advanceToStep3();

      // Confirm we are on template step
      expect(hasStepPill("STEP 4 OF 5")).toBe(true);

      // Click "Check my resume"
      const generateBtn = screen.getByRole("button", { name: /check my resume/i });
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByTestId("analysis-workspace")).toBeTruthy();
      });

      expect(screen.getByTestId("analysis-workspace")).toHaveAttribute(
        "data-initial-suggestions-review-open",
        "true",
      );

      // Verify the API was called
      expect(mockCreateResumeAnalysis).toHaveBeenCalledTimes(1);
    });

    it("stays on template step and shows error when Check my resume fails", async () => {
      mockCreateResumeAnalysis.mockRejectedValue(new Error("Server error"));

      render(<AnalysisWizard />);

      await advanceToStep3();

      const generateBtn = screen.getByRole("button", { name: /check my resume/i });
      fireEvent.click(generateBtn);

      // Should remain on template step with an error message
      await waitFor(() => {
        expect(hasStepPill("STEP 4 OF 5")).toBe(true);
        expect(screen.getByText("Server error")).toBeTruthy();
      });
    });

    it("falls back to local template when server returns unknown template id", async () => {
      mockCreateResumeAnalysis.mockResolvedValue({
        ...minimalAnalysisResult,
        selectedTemplateId: "unknown-template-id",
      });

      render(<AnalysisWizard />);

      await advanceToStep3();

      const generateBtn = screen.getByRole("button", { name: /check my resume/i });
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByTestId("analysis-workspace")).toBeTruthy();
      });

      expect(screen.getByTestId("analysis-workspace")).toHaveAttribute(
        "data-selected-template-id",
        "minimalist-grid",
      );
    });
  });

  describe("analysis quota enforcement", () => {
    it("shows upload-disabled step 3 when quota is exhausted", async () => {
      mockUseAnalysisQuota.mockReturnValue({
        quota: {
          limit: 1,
          used: 1,
          canAnalyze: false,
          analysisId: "saved-analysis-1",
          redeemedAt: "2026-01-01T00:00:00.000Z",
        },
        error: "",
        isLoading: false,
        refetch: vi.fn(),
      });

      render(<AnalysisWizard />);

      await waitFor(() => {
        expect(screen.getByText(/free check already used/i)).toBeInTheDocument();
      });
      expect(screen.queryByRole("button", { name: /next: paste job post/i })).not.toBeInTheDocument();
    });

    it("allows scratch builder when quota is exhausted", async () => {
      mockUseAnalysisQuota.mockReturnValue({
        quota: {
          limit: 1,
          used: 1,
          canAnalyze: false,
          analysisId: "saved-analysis-1",
          redeemedAt: "2026-01-01T00:00:00.000Z",
        },
        error: "",
        isLoading: false,
        refetch: vi.fn(),
      });

      render(<AnalysisWizard />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /start with a blank resume/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /start with a blank resume/i }));
      fireEvent.click(screen.getByRole("button", { name: /open builder/i }));

      await waitFor(() => {
        expect(screen.getByTestId("analysis-workspace")).toBeInTheDocument();
      });
      expect(mockCreateResumeAnalysis).not.toHaveBeenCalled();
    });

    it("opens scratch mode directly from query param", async () => {
      mockUseSearchParams.mockReturnValue(new URLSearchParams("mode=scratch"));

      render(<AnalysisWizard />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /open builder/i })).toBeInTheDocument();
      });
    });

    it("clears an uploaded file when starting from scratch is chosen", async () => {
      render(<AnalysisWizard />);

      await advanceToStep2();

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const pdfFile = new File(["pdf content"], "resume.pdf", { type: "application/pdf" });
      Object.defineProperty(fileInput, "files", { value: [pdfFile], configurable: true });
      fireEvent.change(fileInput);

      expect(screen.getByText("resume.pdf")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /start with a blank resume/i }));

      expect(screen.queryByText("resume.pdf")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /open builder/i })).toBeInTheDocument();
    });

    it("stays in the workspace after a successful check even when quota flips to exhausted", async () => {
      function WizardWithQuotaFlip() {
        const [quota, setQuota] = React.useState({
          limit: 1,
          used: 0,
          canAnalyze: true,
          analysisId: null as string | null,
          redeemedAt: null as string | null,
        });

        mockUseAnalysisQuota.mockReturnValue({
          quota,
          error: "",
          isLoading: false,
          refetch: () =>
            setQuota({
              limit: 1,
              used: 1,
              canAnalyze: false,
              analysisId: "test-analysis-123",
              redeemedAt: "2026-01-01T00:00:00.000Z",
            }),
        });

        return <AnalysisWizard />;
      }

      mockCreateResumeAnalysis.mockResolvedValue(minimalAnalysisResult);

      render(<WizardWithQuotaFlip />);

      await advanceToStep3();
      fireEvent.click(screen.getByRole("button", { name: /check my resume/i }));

      await waitFor(() => {
        expect(screen.getByTestId("analysis-workspace")).toBeInTheDocument();
      });

      // Quota refetch from the success path should not kick the user back to upload.
      await waitFor(() => {
        expect(screen.getByTestId("analysis-workspace")).toBeInTheDocument();
      });
      expect(screen.queryByText(/free check already used/i)).not.toBeInTheDocument();
    });

    it("opens the saved check when analysis fails after quota was already redeemed", async () => {
      function WizardWithQuotaRecovery() {
        const [quota, setQuota] = React.useState({
          limit: 1,
          used: 0,
          canAnalyze: true,
          analysisId: null as string | null,
          redeemedAt: null as string | null,
        });

        mockUseAnalysisQuota.mockReturnValue({
          quota,
          error: "",
          isLoading: false,
          refetch: () =>
            setQuota({
              limit: 1,
              used: 1,
              canAnalyze: false,
              analysisId: "saved-after-timeout",
              redeemedAt: "2026-01-01T00:00:00.000Z",
            }),
        });

        return <AnalysisWizard />;
      }

      mockCreateResumeAnalysis.mockRejectedValue(new Error("Request timeout after 120000ms"));

      render(<WizardWithQuotaRecovery />);

      await advanceToStep3();
      fireEvent.click(screen.getByRole("button", { name: /check my resume/i }));

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith("/analysis/saved-after-timeout");
      });
    });
  });
});
