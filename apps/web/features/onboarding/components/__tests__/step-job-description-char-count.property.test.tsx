/**
 * Property-Based Test — Property 2: Live character count accuracy
 *
 * Feature: resume-editor-flow, Property 2: Live character count accuracy
 *
 * For any string input to the job description field, the displayed character
 * count should equal the trimmed length of that string.
 *
 * Validates: Requirements 1.5
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as fc from "fast-check";
import { StepJobDescription } from "../step-job-description";

/**
 * Renders StepJobDescription with the given jobDescription.
 */
function renderStep(jobDescription: string) {
  render(
    <StepJobDescription
      jobDescription={jobDescription}
      setJobDescription={vi.fn()}
      onNext={vi.fn()}
      canContinue={jobDescription.trim().length >= 30}
    />,
  );
}

describe(
  "Feature: resume-editor-flow, Property 2: Live character count accuracy",
  () => {
    /**
     * Property 2: Displayed character count equals jobDescription.trim().length
     *
     * Validates: Requirements 1.5
     */
    it(
      "displayed character count equals jobDescription.trim().length",
      () => {
        fc.assert(
          fc.property(fc.string(), (jobDescription) => {
            renderStep(jobDescription);

            const expectedCount = jobDescription.trim().length;
            const countText = screen.getByText(`${expectedCount} characters`);

            expect(countText).toBeTruthy();

            // Cleanup between iterations
            document.body.innerHTML = "";
          }),
          { numRuns: 100 },
        );
      },
    );
  },
);
