/**
 * Property-Based Test — Property 9: Keyword counts display
 *
 * Feature: resume-editor-flow, Property 9: Keyword counts display
 *
 * For any ResumeAnalysisResult, the suggestions panel should display a matched
 * keyword count equal to matchedKeywords.length and a missing keyword count
 * equal to missingKeywords.length.
 *
 * Validates: Requirements 4.6
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, within } from "@testing-library/react";
import * as fc from "fast-check";
import { StepSuggestions } from "../step-suggestions";
import type { ResumeAnalysisResult } from "../../../editor/model/resume-analysis";

/** Builds a minimal ResumeAnalysisResult with the given keyword arrays. */
function buildAnalysisResult(
  matchedKeywords: string[],
  missingKeywords: string[],
): ResumeAnalysisResult {
  return {
    targetRole: "Software Engineer",
    score: 75,
    metricsFound: 2,
    matchedKeywords,
    missingKeywords,
    suggestions: [],
    generatedAt: new Date().toISOString(),
  };
}

describe(
  "Feature: resume-editor-flow, Property 9: Keyword counts display",
  () => {
    /**
     * Property 9: Summary bar matched count equals matchedKeywords.length and
     * missing count equals missingKeywords.length.
     *
     * Validates: Requirements 4.6
     */
    it(
      "displays matched count equal to matchedKeywords.length and missing count equal to missingKeywords.length",
      () => {
        fc.assert(
          fc.property(
            fc.record({
              matchedKeywords: fc.array(fc.string()),
              missingKeywords: fc.array(fc.string()),
            }),
            ({ matchedKeywords, missingKeywords }) => {
              const analysisResult = buildAnalysisResult(matchedKeywords, missingKeywords);

              const container = document.createElement("div");
              document.body.appendChild(container);

              const { unmount } = render(
                <StepSuggestions
                  analysisResult={analysisResult}
                  onEnterEditor={vi.fn()}
                  onBack={vi.fn()}
                />,
                { container },
              );

              // Locate the summary bar grid to scope queries and avoid
              // collisions with other text in the component.
              const summaryBar = container.querySelector(
                ".grid.grid-cols-2",
              ) as HTMLElement;
              expect(summaryBar).not.toBeNull();

              const matchedLabel = within(summaryBar).getByText("Matched", { exact: false });
              const missingLabel = within(summaryBar).getByText("Missing", { exact: false });

              // The count is the previous sibling <p> element of the label <p>.
              const matchedNumber = matchedLabel.previousElementSibling;
              const missingNumber = missingLabel.previousElementSibling;

              expect(matchedNumber).not.toBeNull();
              expect(missingNumber).not.toBeNull();

              expect(Number(matchedNumber!.textContent)).toBe(matchedKeywords.length);
              expect(Number(missingNumber!.textContent)).toBe(missingKeywords.length);

              unmount();
              document.body.removeChild(container);
            },
          ),
          { numRuns: 100 },
        );
      },
    );
  },
);
