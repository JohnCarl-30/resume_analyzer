/**
 * Bug Condition Exploration Test — Bug 1
 *
 * Property 1: Bug Condition — Template Switch Does Not Update Preview or Highlight
 *
 * Validates: Requirements 1.1, 1.2
 *
 * CRITICAL: This test MUST FAIL on unfixed code.
 * Failure confirms the bug exists. DO NOT fix the production code to make this pass.
 * This test encodes the expected behavior — it will validate the fix when it passes
 * after the fix is implemented in task 3.
 *
 * Bug Condition (formal):
 *   event.clickedTemplateId != currentSelectedTemplateId
 *   AND AnalysisWorkspace has no local state copy of selectedTemplateId
 *   AND previewMode is already "structured"
 *   AND ResumeRenderer receives stale selectedTemplateId prop after modal closes
 *
 * Scoped PBT Approach:
 *   Concrete failing case — clicking "Harvard Classic" while previewMode is already
 *   "structured" and AnalysisWorkspace holds no local activeTemplateId state.
 *
 * Counterexamples found (confirmed by running on unfixed code — all 3 tests FAIL):
 *
 *   Property 1a counterexample:
 *     Expected: capturedVariantId === "harvard-classic"
 *     Received: capturedVariantId === "minimalist-grid"
 *     Reason: AnalysisWorkspace passes selectedTemplateId prop directly to ResumeRenderer
 *     (variantId={selectedTemplateId}) with no local state copy. After clicking "Harvard
 *     Classic", handleSelectTemplate calls onTemplateChange?.("harvard-classic") which
 *     schedules a parent state update, but the parent has not re-rendered yet. The modal
 *     closes immediately and ResumeRenderer still receives the stale "minimalist-grid" prop.
 *
 *   Property 1b counterexample:
 *     Expected: aria-pressed === "true" for Harvard Classic TemplateCard
 *     Received: aria-pressed === "false"
 *     Reason: isSelected={selectedTemplateId === template.id} uses the prop value directly.
 *     Since the parent has not re-rendered, selectedTemplateId is still "minimalist-grid",
 *     so isSelected evaluates to false for "harvard-classic".
 *
 *   Property 1c counterexample:
 *     Expected: aria-pressed === "false" for Minimalist Grid TemplateCard
 *     Received: aria-pressed === "true"
 *     Reason: Same as 1b — selectedTemplateId prop is still "minimalist-grid", so
 *     isSelected evaluates to true for "minimalist-grid" even after clicking "harvard-classic".
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ResumeTemplateVariant } from "../../../templates/model/template";
import type { ResumeForm } from "../../model/resume-form";
import type { ResumeAnalysisResult } from "../../model/resume-analysis";

// ---------------------------------------------------------------------------
// Spy on ResumeRenderer to capture the variantId prop it receives.
// We use vi.mock so we can inspect what variantId the component is called with
// immediately after the template card click — before any parent re-render.
// ---------------------------------------------------------------------------
let capturedVariantId: ResumeTemplateVariant | null = null;

vi.mock("../../components/resume-renderer", () => ({
  ResumeRenderer: ({ variantId }: { form: ResumeForm; variantId: ResumeTemplateVariant }) => {
    capturedVariantId = variantId;
    return (
      <div data-testid="resume-renderer" data-variant-id={variantId}>
        ResumeRenderer:{variantId}
      </div>
    );
  },
}));

// Mock TemplateRealPreview to avoid image loading issues in jsdom
vi.mock("../../../templates/components/template-preview", () => ({
  TemplateRealPreview: ({ variantId }: { variantId: string }) => (
    <div data-testid={`template-preview-${variantId}`}>{variantId}</div>
  ),
}));

// Import AFTER mocks are set up
import { AnalysisWorkspace } from "../analysis-workspace";

// ---------------------------------------------------------------------------
// Minimal props factory
// ---------------------------------------------------------------------------
const minimalAnalysisResult: ResumeAnalysisResult = {
  id: "test-analysis-1",
  targetRole: "Software Engineer",
  score: 72,
  metricsFound: 3,
  matchedKeywords: ["React", "TypeScript"],
  missingKeywords: ["GraphQL"],
  suggestions: [],
  generatedAt: new Date().toISOString(),
  // extractedProfile is non-null so previewMode initializes to "structured"
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

function renderWorkspace(overrides?: { onTemplateChange?: (id: ResumeTemplateVariant) => void }) {
  const onTemplateChange = overrides?.onTemplateChange ?? vi.fn();

  return render(
    <AnalysisWorkspace
      targetRole="Software Engineer"
      selectedTemplateId="minimalist-grid"
      resumeFileName="resume.pdf"
      resumeSourceUrl={null}
      resumePreviewUrl={null}
      analysisResult={minimalAnalysisResult}
      onBack={vi.fn()}
      onTemplateChange={onTemplateChange}
    />,
  );
}

// ---------------------------------------------------------------------------
// Helper: open the "Switch Template" modal
// ---------------------------------------------------------------------------
function openTemplateModal() {
  // The "Switch Template" button is the one with GridIcon — text "resume.pdf" humanized
  // There are two buttons that open the templates modal: the title button and the grid button.
  // We click the one with aria-label or text "Switch Template" header button.
  // In the component, clicking the button with GridIcon sets modalView="templates".
  // We find it by its text content (humanizeFileName("resume.pdf") = "resume").
  const switchTemplateButtons = screen.getAllByRole("button");
  // Find the button that opens the templates modal — it contains the GridIcon and humanized filename
  // The component renders: <GridIcon /> {humanizeFileName(resumeFileName)}
  // humanizeFileName("resume.pdf") => "resume"
  const gridButton = switchTemplateButtons.find(
    (btn) => btn.textContent?.includes("resume") && !btn.textContent?.includes("Back"),
  );
  if (!gridButton) throw new Error("Could not find Switch Template button");
  fireEvent.click(gridButton);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Bug 1 — Template Switch Does Not Update Preview or Highlight (UNFIXED CODE)", () => {
  beforeEach(() => {
    capturedVariantId = null;
  });

  /**
   * Property 1a: After clicking a different template card in the modal,
   * ResumeRenderer SHALL receive the newly selected variantId immediately.
   *
   * EXPECTED TO FAIL on unfixed code:
   * Counterexample — ResumeRenderer.variantId is still "minimalist-grid"
   * because AnalysisWorkspace passes selectedTemplateId prop directly without
   * a local state copy, and the parent callback has not triggered a re-render.
   *
   * Validates: Requirements 1.1
   */
  it("Property 1a: ResumeRenderer receives variantId='harvard-classic' immediately after clicking Harvard Classic card", () => {
    renderWorkspace();

    // Verify initial state: ResumeRenderer starts with "minimalist-grid"
    expect(capturedVariantId).toBe("minimalist-grid");

    // Open the Switch Template modal
    openTemplateModal();

    // The modal should now be open — find the "Harvard Classic" TemplateCard button
    // TemplateCard renders a <button> with aria-pressed and the template name as text
    const harvardButton = screen.getByRole("button", { name: /harvard classic/i });
    expect(harvardButton).toBeInTheDocument();

    // Reset captured value to detect the re-render after click
    capturedVariantId = null;

    // Click the Harvard Classic card
    fireEvent.click(harvardButton);

    // ASSERTION: ResumeRenderer should now receive variantId="harvard-classic"
    // This FAILS on unfixed code because selectedTemplateId prop is still "minimalist-grid"
    // Counterexample: capturedVariantId === "minimalist-grid" (stale prop)
    expect(capturedVariantId).toBe("harvard-classic");
  });

  /**
   * Property 1b: After clicking "Harvard Classic", the Harvard Classic TemplateCard
   * SHALL have isSelected=true (aria-pressed="true").
   *
   * EXPECTED TO FAIL on unfixed code:
   * Counterexample — aria-pressed is still "false" for Harvard Classic because
   * isSelected={selectedTemplateId === template.id} uses the stale prop value.
   *
   * Validates: Requirements 1.2
   */
  it("Property 1b: Harvard Classic TemplateCard has isSelected=true immediately after clicking it", () => {
    renderWorkspace();

    // Open the Switch Template modal
    openTemplateModal();

    const harvardButton = screen.getByRole("button", { name: /harvard classic/i });

    // Before click: Harvard Classic should NOT be selected
    expect(harvardButton).toHaveAttribute("aria-pressed", "false");

    // Click the Harvard Classic card
    fireEvent.click(harvardButton);

    // ASSERTION: Harvard Classic card should now be selected (aria-pressed="true")
    // This FAILS on unfixed code because isSelected still uses the stale prop
    // Counterexample: aria-pressed === "false" (prop hasn't updated yet)
    expect(harvardButton).toHaveAttribute("aria-pressed", "true");
  });

  /**
   * Property 1c: After clicking "Harvard Classic", the Minimalist Grid TemplateCard
   * SHALL have isSelected=false (aria-pressed="false").
   *
   * EXPECTED TO FAIL on unfixed code:
   * Counterexample — aria-pressed is still "true" for Minimalist Grid because
   * the selectedTemplateId prop has not changed.
   *
   * Validates: Requirements 1.2
   */
  it("Property 1c: Minimalist Grid TemplateCard has isSelected=false after clicking Harvard Classic", () => {
    renderWorkspace();

    // Open the Switch Template modal
    openTemplateModal();

    const minimalistButton = screen.getByRole("button", { name: /minimalist grid/i });
    const harvardButton = screen.getByRole("button", { name: /harvard classic/i });

    // Before click: Minimalist Grid IS selected
    expect(minimalistButton).toHaveAttribute("aria-pressed", "true");

    // Click Harvard Classic
    fireEvent.click(harvardButton);

    // ASSERTION: Minimalist Grid should now be deselected
    // This FAILS on unfixed code because selectedTemplateId prop is still "minimalist-grid"
    // Counterexample: aria-pressed === "true" (prop hasn't changed)
    expect(minimalistButton).toHaveAttribute("aria-pressed", "false");
  });
});
