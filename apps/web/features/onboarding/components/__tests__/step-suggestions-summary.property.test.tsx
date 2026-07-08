/**
 * Property-Based Test — Property 8: Suggestion summary counts
 *
 * Feature: resume-editor-flow, Property 8: Suggestion summary counts
 *
 * For any array of AnalysisSuggestion objects, the summary bar should display
 * a total count equal to the array length and an important count equal to the
 * number of suggestions with severity === "high".
 *
 * Validates: Requirements 4.3
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, within } from "@testing-library/react";
import * as fc from "fast-check";
import { StepSuggestions } from "../step-suggestions";
import type { ResumeAnalysisResult, AnalysisSuggestion } from "../../../editor/model/resume-analysis";

/** Arbitrary for a single AnalysisSuggestion. */
const suggestionArbitrary = fc.record({
  id: fc.string(),
  title: fc.string(),
  detail: fc.string(),
  severity: fc.constantFrom("high" as const, "medium" as const, "low" as const),
  category: fc.constantFrom("keywords" as const, "writing" as const, "impact" as const),
});

/** Builds a minimal ResumeAnalysisResult with the given suggestions array. */
function buildAnalysisResult(suggestions: AnalysisSuggestion[]): ResumeAnalysisResult {
  return {
    targetRole: "Software Engineer",
    score: 75,
    metricsFound: 2,
    matchedKeywords: [],
    missingKeywords: [],
    suggestions,
    generatedAt: new Date().toISOString(),
  };
}

describe(
  "Feature: resume-editor-flow, Property 8: Suggestion summary counts",
  () => {
    /**
     * Property 8: Summary bar total count equals array length and important count
     * equals the number of suggestions with severity === "high".
     *
     * Validates: Requirements 4.3
     */
    it(
      "displays total count equal to suggestions.length and important count equal to high-severity count",
      () => {
        fc.assert(
          fc.property(
            fc.uniqueArray(suggestionArbitrary, {
              selector: (suggestion) => suggestion.id,
            }),
            (suggestions) => {
              const expectedTotal = suggestions.length;
              const expectedImportant = suggestions.filter((s) => s.severity === "high").length;

              const analysisResult = buildAnalysisResult(suggestions);

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

              // The summary bar is a grid of 4 stat items. We locate it by a
              // stable test id and then scope queries within it to avoid collisions
              // with "Important" badge text that may appear in suggestion cards.
              const summaryBar = within(container).getByTestId("suggestion-summary");

              const totalItem = within(summaryBar).getByTestId("summary-suggestions");
              const importantItem = within(summaryBar).getByTestId("summary-important");

              const totalNumber = within(totalItem).getByText(String(expectedTotal), { exact: true });
              const importantNumber = within(importantItem).getByText(String(expectedImportant), { exact: true });

              expect(Number(totalNumber.textContent)).toBe(expectedTotal);
              expect(Number(importantNumber.textContent)).toBe(expectedImportant);

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
