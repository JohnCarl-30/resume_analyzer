/**
 * Property-Based Test — Property 7: Suggestion card rendering
 *
 * Feature: resume-editor-flow, Property 7: Suggestion card rendering
 *
 * For any AnalysisSuggestion object, the rendered suggestion card should
 * contain the suggestion's title, detail text, and a severity badge whose
 * label corresponds to the severity value.
 *
 * Severity badge mapping:
 *   "high"   → "Critical"
 *   "medium" → "Impact"
 *   "low"    → "Edit"
 *
 * Validates: Requirements 4.2
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, within } from "@testing-library/react";
import * as fc from "fast-check";
import { StepSuggestions } from "../step-suggestions";
import type { ResumeAnalysisResult, AnalysisSuggestion } from "../../../editor/model/resume-analysis";

/** Maps severity to the expected badge label. */
function expectedBadgeLabel(severity: AnalysisSuggestion["severity"]): string {
  if (severity === "high") return "Critical";
  if (severity === "medium") return "Impact";
  return "Edit";
}

/** Builds a minimal ResumeAnalysisResult containing a single suggestion. */
function buildAnalysisResult(suggestion: AnalysisSuggestion): ResumeAnalysisResult {
  return {
    targetRole: "Software Engineer",
    score: 75,
    metricsFound: 2,
    matchedKeywords: [],
    missingKeywords: [],
    suggestions: [suggestion],
    generatedAt: new Date().toISOString(),
  };
}

describe(
  "Feature: resume-editor-flow, Property 7: Suggestion card rendering",
  () => {
    /**
     * Property 7: Suggestion card renders title, detail, and correct badge label
     *
     * Validates: Requirements 4.2
     */
    it(
      "renders title, detail text, and correct severity badge for any suggestion",
      () => {
        fc.assert(
          fc.property(
            fc.record({
              id: fc.string(),
              title: fc.string(),
              detail: fc.string(),
              severity: fc.constantFrom("high" as const, "medium" as const, "low" as const),
              category: fc.constantFrom("keywords" as const, "writing" as const, "impact" as const),
            }),
            (suggestion) => {
              const analysisResult = buildAnalysisResult(suggestion);

              // Create a fresh container per iteration so accumulated renders
              // from previous iterations (including shrinking) don't interfere.
              const iterContainer = document.createElement("div");
              document.body.appendChild(iterContainer);

              const { unmount } = render(
                <StepSuggestions
                  analysisResult={analysisResult}
                  onEnterEditor={vi.fn()}
                  onBack={vi.fn()}
                />,
                { container: iterContainer },
              );

              // Scope all assertions to the suggestion card <article> element
              // to avoid collisions with the summary bar (which also shows "Critical").
              const card = within(iterContainer).getByRole("article");

              // Assert title is rendered inside the card via the <h3> element
              const heading = card.querySelector("h3");
              expect(heading).not.toBeNull();
              expect(heading!.textContent).toBe(suggestion.title);

              // Assert detail text is rendered inside the card via the <p> element
              const detail = card.querySelector("p");
              expect(detail).not.toBeNull();
              expect(detail!.textContent).toBe(suggestion.detail);

              // Assert correct badge label is rendered inside the card
              const badgeLabel = expectedBadgeLabel(suggestion.severity);
              const badge = within(card).getByText(badgeLabel, { exact: true });
              expect(badge).toBeTruthy();

              // Unmount and remove the container to keep the DOM clean
              unmount();
              document.body.removeChild(iterContainer);
            },
          ),
          { numRuns: 100 },
        );
      },
    );
  },
);
