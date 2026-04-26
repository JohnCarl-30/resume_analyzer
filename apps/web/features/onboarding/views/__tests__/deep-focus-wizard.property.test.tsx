/**
 * Property-Based Test — Property 14: Step indicator accuracy
 *
 * Feature: resume-editor-flow, Property 14: Step indicator accuracy
 *
 * For any numbered wizard step value N in {2, 3, 4, 5}, the step indicator should
 * display "STEP N OF 5".
 *
 * Each numbered step component renders its own "STEP N OF 5" pill directly.
 * Steps 2–5 are tested by rendering the corresponding step component with
 * minimal required props and asserting the pill text.
 *
 * Validates: Requirements 6.1
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as fc from "fast-check";
import { StepJobDescription } from "../../components/step-job-description";
import { StepDocumentUpload } from "../../components/step-document-upload";
import { StepTemplateSelection } from "../../components/step-template-selection";
import { StepSuggestions } from "../../components/step-suggestions";
import type { ResumeAnalysisResult } from "../../../editor/model/resume-analysis";

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

/**
 * Renders the step component for the given step number and returns the
 * container so we can assert the pill text.
 */
function renderStep(step: 2 | 3 | 4 | 5): HTMLElement {
  const container = document.createElement("div");
  document.body.appendChild(container);

  if (step === 2) {
    render(
      <StepJobDescription
        jobDescription=""
        setJobDescription={vi.fn()}
        onNext={vi.fn()}
        canContinue={false}
      />,
      { container },
    );
  } else if (step === 3) {
    render(
      <StepDocumentUpload
        resumeInputId="test-input"
        resumeInputRef={{ current: null }}
        isDragActive={false}
        setIsDragActive={vi.fn()}
        handleDrop={vi.fn()}
        handleFileChange={vi.fn()}
        resumeFile={null}
        formatFileSize={(size) => `${size} B`}
        openFilePicker={vi.fn()}
        uploadError=""
        onNext={vi.fn()}
        canContinue={false}
      />,
      { container },
    );
  } else if (step === 4) {
    render(
      <StepTemplateSelection
        selectedTemplateId="minimalist-grid"
        setSelectedTemplateId={vi.fn()}
        onNext={vi.fn()}
      />,
      { container },
    );
  } else {
    render(
      <StepSuggestions
        analysisResult={minimalAnalysisResult}
        onEnterEditor={vi.fn()}
        onBack={vi.fn()}
      />,
      { container },
    );
  }

  return container;
}

describe(
  "Feature: resume-editor-flow, Property 14: Step indicator accuracy",
  () => {
    /**
     * Property 14: Step indicator shows "STEP N OF 5" for each step N in {2,3,4,5}
     *
     * Validates: Requirements 6.1
     */
    it(
      'renders "STEP N OF 5" pill for each step N in {2, 3, 4, 5}',
      () => {
        fc.assert(
          fc.property(
            fc.constantFrom(2 as const, 3 as const, 4 as const, 5 as const),
            (step) => {
              const container = renderStep(step);

              const expectedText = `STEP ${step} OF 5`;
              const pill = screen.getByText(expectedText);
              expect(pill).toBeTruthy();
              expect(pill.textContent).toBe(expectedText);

              // Clean up between iterations
              document.body.removeChild(container);
              document.body.innerHTML = "";
            },
          ),
          { numRuns: 100 },
        );
      },
    );
  },
);
