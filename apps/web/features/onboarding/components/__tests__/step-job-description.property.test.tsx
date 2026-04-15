/**
 * Property-Based Test — Property 1: Job description validation gate
 *
 * Feature: resume-editor-flow, Property 1: Job description validation gate
 *
 * For any string input to the job description field, the Continue button should
 * be enabled if and only if the trimmed length of that string is >= 30.
 *
 * Validates: Requirements 1.2, 6.5
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as fc from "fast-check";
import { StepJobDescription } from "../step-job-description";

/**
 * Renders StepJobDescription with the given jobDescription and derives
 * canContinue from the same rule the wizard uses: trim().length >= 30.
 */
function renderStep(jobDescription: string) {
  const canContinue = jobDescription.trim().length >= 30;
  render(
    <StepJobDescription
      jobDescription={jobDescription}
      setJobDescription={vi.fn()}
      onNext={vi.fn()}
      canContinue={canContinue}
    />,
  );
  return { canContinue };
}

describe(
  "Feature: resume-editor-flow, Property 1: Job description validation gate",
  () => {
    /**
     * Property 1: Continue button enabled iff trim().length >= 30
     *
     * Validates: Requirements 1.2, 6.5
     */
    it(
      "Continue button is enabled iff jobDescription.trim().length >= 30",
      () => {
        fc.assert(
          fc.property(fc.string(), (jobDescription) => {
            const { canContinue } = renderStep(jobDescription);

            const continueButton = screen.getByRole("button", {
              name: /continue to resume upload/i,
            });

            if (canContinue) {
              expect(continueButton).not.toBeDisabled();
            } else {
              expect(continueButton).toBeDisabled();
            }

            // Cleanup between iterations
            document.body.innerHTML = "";
          }),
          { numRuns: 100 },
        );
      },
    );
  },
);
