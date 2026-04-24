/**
 * Property-Based Test — Property 16: Tailor modal pre-fill
 *
 * Feature: resume-editor-flow, Property 16: Tailor modal pre-fill
 *
 * For any current job description string, opening the "Tailor to Job" modal
 * should pre-fill the job description input with that exact string.
 *
 * Validates: Requirements 8.2
 *
 * Tag format: Feature: resume-editor-flow, Property 16: Tailor modal pre-fill
 * Minimum 100 iterations
 */

import React from "react";
import { describe, it, vi } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as fc from "fast-check";
import type { ResumeForm } from "../../model/resume-form";
import type { ResumeTemplateVariant } from "../../../templates/model/template";

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

// Import AFTER mocks are set up
import { AnalysisWorkspace } from "../analysis-workspace";

// ---------------------------------------------------------------------------
// Helper: build a minimal analysisResult with a given jobDescription
// ---------------------------------------------------------------------------
function buildAnalysisResult(jobDescription: string) {
  return {
    id: "test-tailor-prefill",
    targetRole: "Software Engineer",
    jobDescription,
    score: 72,
    metricsFound: 0,
    matchedKeywords: [],
    missingKeywords: [],
    suggestions: [],
    generatedAt: new Date().toISOString(),
    extractedProfile: {
      fullName: "Test User",
      email: "test@example.com",
      phone: "555-0000",
      summary: "",
      skills: [],
      education: [],
      experience: [],
      leadership: [],
      projects: [],
      awards: [],
    },
  };
}

// ---------------------------------------------------------------------------
// Property 16: Tailor modal pre-fill
// ---------------------------------------------------------------------------

describe(
  "Feature: resume-editor-flow, Property 16: Tailor modal pre-fill",
  () => {
    /**
     * **Validates: Requirements 8.2**
     *
     * For any job description string (minLength: 30), opening the "Tailor to Job"
     * modal pre-fills the textarea with the exact jobDescription string.
     *
     * Strategy:
     * 1. Render AnalysisWorkspace with an analysisResult that has a jobDescription
     * 2. Click the "Tailor to Job" button in the header to open the modal
     * 3. Assert the textarea in the modal has value equal to the jobDescription
     */
    it(
      "pre-fills the tailor modal textarea with the exact current job description",
      async () => {
        await fc.assert(
          fc.asyncProperty(fc.string({ minLength: 30 }), async (jobDescription) => {
            const user = userEvent.setup();
            const analysisResult = buildAnalysisResult(jobDescription);

            const { unmount, container } = render(
              <AnalysisWorkspace
                targetRole="Software Engineer"
                selectedTemplateId="minimalist-grid"
                resumeFileName="resume.pdf"
                resumeSourceUrl={null}
                resumePreviewUrl={null}
                analysisResult={analysisResult}
                onBack={vi.fn()}
              />,
            );

            // Find and click the "Tailor to Job" button in the header
            const tailorButton = Array.from(container.querySelectorAll("button")).find(
              (btn) => btn.textContent?.trim() === "Tailor to Job",
            );
            if (!tailorButton) {
              unmount();
              return false;
            }
            await user.click(tailorButton);

            // Find the textarea inside the tailor modal
            const textarea = container.querySelector<HTMLTextAreaElement>(
              "textarea[placeholder='Paste the full job description here...']",
            );
            if (!textarea) {
              unmount();
              return false;
            }

            const prefillOk = textarea.value === jobDescription;

            unmount();
            return prefillOk;
          }),
          { numRuns: 100 },
        );
      },
    );
  },
);
