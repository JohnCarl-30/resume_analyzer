/**
 * Property-Based Test — Property 9: Keyword counts display
 *
 * Feature: resume-editor-flow, Property 9: Keyword counts display
 *
 * For any ResumeAnalysisResult, the suggestions panel should display a found
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
     * Property 9: Summary bar found count equals matchedKeywords.length and
     * missing count equals missingKeywords.length.
     *
     * Validates: Requirements 4.6
     */
    it(
      "displays found count equal to matchedKeywords.length and missing count equal to missingKeywords.length",
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

              // Locate the summary bar to scope queries and avoid collisions
              // with other text in the component.
              const summaryBar = within(container).getByTestId("suggestion-summary");

              const matchedItem = within(summaryBar).getByTestId("summary-found");
              const missingItem = within(summaryBar).getByTestId("summary-missing");

              const matchedNumber = within(matchedItem).getByText(String(matchedKeywords.length), { exact: true });
              const missingNumber = within(missingItem).getByText(String(missingKeywords.length), { exact: true });

              expect(Number(matchedNumber.textContent)).toBe(matchedKeywords.length);
              expect(Number(missingNumber.textContent)).toBe(missingKeywords.length);

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
