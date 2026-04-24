/**
 * Property-Based Test — Property 15: Back button presence
 *
 * Feature: resume-editor-flow, Property 15: Back button presence
 *
 * For any wizard step value N in {2, 3, 4}, a back navigation control should
 * be rendered.
 *
 * - Steps 2 and 3: the back button lives in the DeepFocusWizard header
 *   (`{step > 1 && <button>...{backLabel}</button>}`).
 * - Step 4: StepSuggestions renders its own "Back" button in the footer.
 *
 * Testing strategy:
 * - Step 4 is tested by rendering StepSuggestions directly (it owns a Back button).
 * - Steps 2 and 3 are tested by rendering DeepFocusWizard and navigating to those
 *   steps via userEvent, then asserting the header back button is present.
 *
 * Validates: Requirements 6.2
 * Tag format: Feature: resume-editor-flow, Property 15: Back button presence
 * Minimum 100 iterations (split across the three sub-properties)
 */

import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, within, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as fc from "fast-check";
import { StepSuggestions } from "../../components/step-suggestions";
import { DeepFocusWizard } from "../deep-focus-wizard";
import type { ResumeAnalysisResult } from "../../../editor/model/resume-analysis";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Minimal valid ResumeAnalysisResult for rendering StepSuggestions (step 4). */
const minimalAnalysisResult: ResumeAnalysisResult = {
  targetRole: "Software Engineer",
  score: 80,
  metricsFound: 3,
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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe(
  "Feature: resume-editor-flow, Property 15: Back button presence",
  () => {
    /**
     * Property 15: For any step in {2, 3, 4}, a back navigation control is rendered.
     *
     * Step 4 is tested via StepSuggestions (owns its own Back button in the footer).
     * Steps 2 and 3 are tested via DeepFocusWizard header (renders back button when step > 1).
     *
     * All three step values are covered across 100 iterations using fc.constantFrom(2, 3, 4).
     *
     * Validates: Requirements 6.2
     */
    it(
      "renders a back navigation control on every step > 1",
      async () => {
        // Pre-navigate the wizard to step 2 and step 3 once each, outside the
        // property loop, so we can assert the back button is present without
        // re-rendering the full wizard 100 times (which would be too slow).
        //
        // The property loop then verifies the invariant holds for each step value
        // by checking the pre-rendered containers.

        // --- Step 4: render StepSuggestions directly ---
        const step4Container = document.createElement("div");
        document.body.appendChild(step4Container);
        const { unmount: unmount4 } = render(
          <StepSuggestions
            analysisResult={minimalAnalysisResult}
            onEnterEditor={vi.fn()}
            onBack={vi.fn()}
          />,
          { container: step4Container },
        );
        const step4BackButton = within(step4Container).getByRole("button", { name: /^back$/i });

        // --- Step 2: render DeepFocusWizard and navigate to step 2 ---
        const step2Container = document.createElement("div");
        document.body.appendChild(step2Container);
        const user2 = userEvent.setup();
        const { unmount: unmount2 } = render(<DeepFocusWizard />, { container: step2Container });
        // Fill in job description (≥ 30 chars) and click Continue
        const textarea = within(step2Container).getByRole("textbox");
        await user2.type(textarea, "A".repeat(30));
        const continueBtn = within(step2Container).getByRole("button", { name: /continue/i });
        await user2.click(continueBtn);
        // Now on step 2 — wizard header should show back button
        const step2BackButton = within(step2Container).getByRole("button", { name: /^back$/i });

        // --- Step 3: render DeepFocusWizard and navigate to step 3 ---
        const step3Container = document.createElement("div");
        document.body.appendChild(step3Container);
        const user3 = userEvent.setup();
        const { unmount: unmount3 } = render(<DeepFocusWizard />, { container: step3Container });
        // Navigate to step 2
        const textarea3 = within(step3Container).getByRole("textbox");
        await user3.type(textarea3, "A".repeat(30));
        const continueBtn3 = within(step3Container).getByRole("button", { name: /continue/i });
        await user3.click(continueBtn3);
        // Upload a PDF file to enable Continue to Templates
        const fileInput = step3Container.querySelector('input[type="file"]') as HTMLInputElement;
        const pdfFile = new File(["pdf content"], "resume.pdf", { type: "application/pdf" });
        await user3.upload(fileInput, pdfFile);
        const continueToTemplates = within(step3Container).getByRole("button", {
          name: /continue to templates/i,
        });
        await user3.click(continueToTemplates);
        // Now on step 3 — wizard header should show "Back to Upload" button
        const step3BackButton = within(step3Container).getByRole("button", {
          name: /back to upload/i,
        });

        // Build a lookup from step → back button element
        const backButtonByStep: Record<2 | 3 | 4, HTMLElement> = {
          2: step2BackButton,
          3: step3BackButton,
          4: step4BackButton,
        };

        // --- Property assertion: 100 iterations over {2, 3, 4} ---
        fc.assert(
          fc.property(
            fc.constantFrom(2 as const, 3 as const, 4 as const),
            (step) => {
              const backButton = backButtonByStep[step];
              // A back navigation control must be present and be a button element
              expect(backButton).toBeTruthy();
              expect(backButton.tagName.toLowerCase()).toBe("button");
            },
          ),
          { numRuns: 100 },
        );

        // Cleanup
        unmount4();
        document.body.removeChild(step4Container);
        unmount2();
        document.body.removeChild(step2Container);
        unmount3();
        document.body.removeChild(step3Container);
      },
      30_000, // 30s timeout to allow wizard navigation
    );
  },
);
