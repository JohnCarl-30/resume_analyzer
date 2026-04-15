/**
 * Preservation Property Tests — Task 2
 *
 * Property 2: Preservation — Non-Switching Inputs and Fallback Behavior Unaffected
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.5
 *
 * EXPECTED OUTCOME: ALL tests PASS on unfixed code.
 * These tests encode baseline behavior that must be preserved after the fix.
 *
 * Preservation requirements tested:
 *   3.1 — Current template stays selected when modal is opened (no new selection made)
 *   3.2 — Closing modal without selecting leaves selectedTemplateId and preview unchanged
 *   3.3 — Empty suggestions shows "No immediate edits suggested" fallback
 *   3.5 — Form data (personalInfo) is preserved when switching templates
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import * as fc from "fast-check";
import type { ResumeTemplateVariant } from "../../../templates/model/template";
import { resumeTemplateVariants } from "../../../templates/model/template";
import type { ResumeForm } from "../../model/resume-form";
import type { ResumeAnalysisResult } from "../../model/resume-analysis";

// ---------------------------------------------------------------------------
// Spy on ResumeRenderer to capture the variantId prop it receives.
// ---------------------------------------------------------------------------
let capturedVariantId: ResumeTemplateVariant | null = null;

vi.mock("../../components/resume-renderer", () => ({
  ResumeRenderer: ({ variantId, form }: { form: ResumeForm; variantId: ResumeTemplateVariant }) => {
    capturedVariantId = variantId;
    return (
      <div data-testid="resume-renderer" data-variant-id={variantId} data-form={JSON.stringify(form)}>
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
// Shared test fixtures
// ---------------------------------------------------------------------------

const minimalAnalysisResult: ResumeAnalysisResult = {
  id: "test-analysis-preservation",
  targetRole: "Software Engineer",
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

const emptySuggestionsAnalysisResult: ResumeAnalysisResult = {
  ...minimalAnalysisResult,
  suggestions: [],
};

const initialFormWithPersonalInfo: ResumeForm = {
  personalInfo: {
    fullName: "Alice Smith",
    phone: "555-9999",
    email: "alice@example.com",
  },
  education: [],
  experience: [],
  leadership: [],
  awards: [],
  projects: [],
};

function renderWorkspace(
  overrides: {
    selectedTemplateId?: ResumeTemplateVariant;
    analysisResult?: ResumeAnalysisResult | null;
    initialForm?: ResumeForm;
    onTemplateChange?: (id: ResumeTemplateVariant) => void;
  } = {},
) {
  const onTemplateChange = overrides.onTemplateChange ?? vi.fn();

  return render(
    <AnalysisWorkspace
      targetRole="Software Engineer"
      selectedTemplateId={overrides.selectedTemplateId ?? "minimalist-grid"}
      resumeFileName="resume.pdf"
      resumeSourceUrl={null}
      resumePreviewUrl={null}
      analysisResult={overrides.analysisResult ?? minimalAnalysisResult}
      initialForm={overrides.initialForm}
      onBack={vi.fn()}
      onTemplateChange={onTemplateChange}
    />,
  );
}

// ---------------------------------------------------------------------------
// Helper: open the "Switch Template" modal
// ---------------------------------------------------------------------------
function openTemplateModal() {
  const buttons = screen.getAllByRole("button");
  const gridButton = buttons.find(
    (btn) => btn.textContent?.includes("resume") && !btn.textContent?.includes("Back"),
  );
  if (!gridButton) throw new Error("Could not find Switch Template button");
  fireEvent.click(gridButton);
}

// Helper: close the template modal via the "Close modal" icon button (aria-label)
function closeTemplateModal() {
  const closeButton = screen.getByRole("button", { name: "Close modal" });
  fireEvent.click(closeButton);
}

// ---------------------------------------------------------------------------
// Preservation Test Suite
// ---------------------------------------------------------------------------

describe("Preservation — Non-Switching Inputs and Fallback Behavior Unaffected", () => {
  beforeEach(() => {
    capturedVariantId = null;
  });

  // -------------------------------------------------------------------------
  // 3.2 — Closing modal without selecting leaves template and preview unchanged
  // -------------------------------------------------------------------------
  describe("3.2 — Close modal without selecting a card", () => {
    it("leaves selectedTemplateId unchanged after closing modal via close button", () => {
      renderWorkspace({ selectedTemplateId: "minimalist-grid" });

      // Capture initial variantId
      const initialVariantId = capturedVariantId;
      expect(initialVariantId).toBe("minimalist-grid");

      // Open the template modal
      openTemplateModal();

      // Modal should be open — close it without selecting a card
      closeTemplateModal();

      // After closing without selecting, variantId must remain unchanged
      expect(capturedVariantId).toBe("minimalist-grid");
    });

    it("leaves the preview rendering unchanged after closing modal without selection", () => {
      renderWorkspace({ selectedTemplateId: "minimalist-grid" });

      // Verify initial renderer state
      const renderer = screen.getByTestId("resume-renderer");
      expect(renderer).toHaveAttribute("data-variant-id", "minimalist-grid");

      // Open modal then close it
      openTemplateModal();
      closeTemplateModal();

      // Preview must still show minimalist-grid
      expect(screen.getByTestId("resume-renderer")).toHaveAttribute(
        "data-variant-id",
        "minimalist-grid",
      );
    });
  });

  // -------------------------------------------------------------------------
  // 3.1 — Re-opening modal shows the correct card highlighted
  // -------------------------------------------------------------------------
  describe("3.1 — Re-opening modal shows correct card highlighted", () => {
    it("shows minimalist-grid as selected when modal is opened without any prior selection", () => {
      renderWorkspace({ selectedTemplateId: "minimalist-grid" });

      // Open the template modal
      openTemplateModal();

      // The minimalist-grid card should be highlighted (aria-pressed="true")
      const minimalistButton = screen.getByRole("button", { name: /minimalist grid/i });
      expect(minimalistButton).toHaveAttribute("aria-pressed", "true");

      // Other cards should NOT be highlighted
      const harvardButton = screen.getByRole("button", { name: /harvard classic/i });
      expect(harvardButton).toHaveAttribute("aria-pressed", "false");
    });

    it("shows harvard-classic as selected when selectedTemplateId prop is harvard-classic", () => {
      renderWorkspace({ selectedTemplateId: "harvard-classic" });

      openTemplateModal();

      const harvardButton = screen.getByRole("button", { name: /harvard classic/i });
      expect(harvardButton).toHaveAttribute("aria-pressed", "true");

      const minimalistButton = screen.getByRole("button", { name: /minimalist grid/i });
      expect(minimalistButton).toHaveAttribute("aria-pressed", "false");
    });
  });

  // -------------------------------------------------------------------------
  // 3.3 — Empty suggestions shows "No immediate edits suggested" fallback
  // -------------------------------------------------------------------------
  describe("3.3 — Empty suggestions fallback message", () => {
    it("displays 'No immediate edits suggested' when analysisResult.suggestions is empty", () => {
      renderWorkspace({ analysisResult: emptySuggestionsAnalysisResult });

      expect(screen.getByText(/no immediate edits suggested/i)).toBeInTheDocument();
    });

    it("does NOT display 'No immediate edits suggested' when suggestions are present", () => {
      renderWorkspace({ analysisResult: minimalAnalysisResult });

      expect(screen.queryByText(/no immediate edits suggested/i)).not.toBeInTheDocument();
    });

    it("renders suggestion cards when suggestions are present", () => {
      renderWorkspace({ analysisResult: minimalAnalysisResult });

      expect(screen.getByText("Add metrics")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // 3.5 — Form data preserved when switching templates
  // -------------------------------------------------------------------------
  describe("3.5 — Form data preserved on template switch", () => {
    it("preserves personalInfo after switching templates", () => {
      const onTemplateChange = vi.fn();
      renderWorkspace({
        selectedTemplateId: "minimalist-grid",
        initialForm: initialFormWithPersonalInfo,
        onTemplateChange,
      });

      // Open modal and click a different template
      openTemplateModal();
      const harvardButton = screen.getByRole("button", { name: /harvard classic/i });
      fireEvent.click(harvardButton);

      // onTemplateChange should have been called
      expect(onTemplateChange).toHaveBeenCalledWith("harvard-classic");

      // The ResumeRenderer should still have the original form data
      const renderer = screen.getByTestId("resume-renderer");
      const formData = JSON.parse(renderer.getAttribute("data-form") ?? "{}") as ResumeForm;
      expect(formData.personalInfo.fullName).toBe("Alice Smith");
      expect(formData.personalInfo.email).toBe("alice@example.com");
      expect(formData.personalInfo.phone).toBe("555-9999");
    });

    it("preserves personalInfo after multiple template switches", () => {
      const onTemplateChange = vi.fn();
      const { rerender } = renderWorkspace({
        selectedTemplateId: "minimalist-grid",
        initialForm: initialFormWithPersonalInfo,
        onTemplateChange,
      });

      // First switch: minimalist-grid -> harvard-classic
      openTemplateModal();
      fireEvent.click(screen.getByRole("button", { name: /harvard classic/i }));

      // Simulate parent updating the prop (as would happen in real app)
      rerender(
        <AnalysisWorkspace
          targetRole="Software Engineer"
          selectedTemplateId="harvard-classic"
          resumeFileName="resume.pdf"
          resumeSourceUrl={null}
          resumePreviewUrl={null}
          analysisResult={minimalAnalysisResult}
          initialForm={initialFormWithPersonalInfo}
          onBack={vi.fn()}
          onTemplateChange={onTemplateChange}
        />,
      );

      // Second switch: harvard-classic -> modern-sans
      openTemplateModal();
      fireEvent.click(screen.getByRole("button", { name: /modern sans/i }));

      // Form data must still be intact
      const renderer = screen.getByTestId("resume-renderer");
      const formData = JSON.parse(renderer.getAttribute("data-form") ?? "{}") as ResumeForm;
      expect(formData.personalInfo.fullName).toBe("Alice Smith");
    });
  });

  // -------------------------------------------------------------------------
  // Property-based test: for any sequence of non-switching inputs,
  // rendered output (variantId) is unchanged
  // -------------------------------------------------------------------------
  describe("PBT — Non-switching inputs leave variantId unchanged", () => {
    /**
     * Property 2a: For all template variants, opening the modal and closing it
     * without clicking a card leaves the variantId unchanged.
     *
     * Validates: Requirements 3.1, 3.2
     */
    it("Property 2a: opening and closing modal without selection preserves variantId for all template variants", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...resumeTemplateVariants),
          (templateId) => {
            capturedVariantId = null;
            const { unmount } = renderWorkspace({ selectedTemplateId: templateId });

            // Capture initial variantId
            expect(capturedVariantId).toBe(templateId);

            // Open modal
            openTemplateModal();

            // Close modal without selecting
            closeTemplateModal();

            // variantId must be unchanged
            const preserved = capturedVariantId === templateId;

            unmount();
            return preserved;
          },
        ),
        { numRuns: resumeTemplateVariants.length },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Property-based test: for any sequence of template selections,
  // form data is always preserved
  // -------------------------------------------------------------------------
  describe("PBT — Form data preserved across template switches", () => {
    /**
     * Property 2b: For any sequence of template selections, form.personalInfo
     * is always preserved (never mutated by a template switch).
     *
     * Validates: Requirements 3.5
     */
    it("Property 2b: personalInfo is preserved across any sequence of template selections", () => {
      // Arbitrary personal info generator
      const personalInfoArb = fc.record({
        fullName: fc.string({ minLength: 1, maxLength: 50 }),
        phone: fc.string({ minLength: 7, maxLength: 20 }),
        email: fc.emailAddress(),
      });

      // Sequence of template selections (1 to 4 switches)
      const templateSequenceArb = fc.array(fc.constantFrom(...resumeTemplateVariants), {
        minLength: 1,
        maxLength: 4,
      });

      fc.assert(
        fc.property(personalInfoArb, templateSequenceArb, (personalInfo, templateSequence) => {
          capturedVariantId = null;

          const initialForm: ResumeForm = {
            personalInfo,
            education: [],
            experience: [],
            leadership: [],
            awards: [],
            projects: [],
          };

          const onTemplateChange = vi.fn();
          const { unmount, rerender } = render(
            <AnalysisWorkspace
              targetRole="Software Engineer"
              selectedTemplateId={templateSequence[0] ?? "minimalist-grid"}
              resumeFileName="resume.pdf"
              resumeSourceUrl={null}
              resumePreviewUrl={null}
              analysisResult={minimalAnalysisResult}
              initialForm={initialForm}
              onBack={vi.fn()}
              onTemplateChange={onTemplateChange}
            />,
          );

          // Perform each template switch in the sequence
          for (let i = 1; i < templateSequence.length; i++) {
            const nextTemplate = templateSequence[i]!;

            // Open modal and click the next template
            openTemplateModal();

            // Find the button for the next template by its name
            const allButtons = screen.getAllByRole("button");
            const targetButton = allButtons.find((btn) =>
              btn.getAttribute("aria-pressed") !== null &&
              btn.textContent?.toLowerCase().includes(nextTemplate.replace(/-/g, " ").toLowerCase().split(" ")[0] ?? ""),
            );

            if (targetButton) {
              fireEvent.click(targetButton);
            }

            // Simulate parent updating the prop
            rerender(
              <AnalysisWorkspace
                targetRole="Software Engineer"
                selectedTemplateId={nextTemplate}
                resumeFileName="resume.pdf"
                resumeSourceUrl={null}
                resumePreviewUrl={null}
                analysisResult={minimalAnalysisResult}
                initialForm={initialForm}
                onBack={vi.fn()}
                onTemplateChange={onTemplateChange}
              />,
            );
          }

          // After all switches, form data must be preserved
          const renderer = screen.getByTestId("resume-renderer");
          const formData = JSON.parse(renderer.getAttribute("data-form") ?? "{}") as ResumeForm;

          const preserved =
            formData.personalInfo.fullName === personalInfo.fullName &&
            formData.personalInfo.email === personalInfo.email &&
            formData.personalInfo.phone === personalInfo.phone;

          unmount();
          return preserved;
        }),
        { numRuns: 20 },
      );
    });
  });
});
