/**
 * Unit Tests — StepSuggestions
 *
 * Feature: resume-editor-flow
 *
 * Validates: Requirements 4.2, 4.3, 4.6, 6.1, 6.2
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepSuggestions } from "../step-suggestions";
import type { ResumeAnalysisResult } from "../../../editor/model/resume-analysis";

function makeAnalysisResult(
  overrides: Partial<ResumeAnalysisResult> = {},
): ResumeAnalysisResult {
  return {
    targetRole: "Software Engineer",
    score: 75,
    metricsFound: 3,
    matchedKeywords: ["React", "TypeScript"],
    missingKeywords: ["GraphQL"],
    suggestions: [],
    generatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function renderStep(
  analysisResult: ResumeAnalysisResult = makeAnalysisResult(),
  overrides: { onEnterEditor?: () => void; onBack?: () => void } = {},
) {
  const onEnterEditor = overrides.onEnterEditor ?? vi.fn();
  const onBack = overrides.onBack ?? vi.fn();
  render(
    <StepSuggestions
      analysisResult={analysisResult}
      onEnterEditor={onEnterEditor}
      onBack={onBack}
    />,
  );
  return { onEnterEditor, onBack };
}

describe("StepSuggestions unit tests", () => {
  /**
   * Requirement 6.1 — step indicator shows current step and total
   */
  it("renders STEP 5 OF 5 step indicator", () => {
    renderStep();
    expect(screen.getByText("STEP 5 OF 5")).toBeTruthy();
  });

  /**
   * Requirement 4.2 — empty suggestions renders neutral message
   */
  it("renders neutral message when there are no suggestions", () => {
    renderStep(makeAnalysisResult({ suggestions: [] }));
    expect(
      screen.getByText(
        "No suggestions — your resume looks well-matched to this role.",
      ),
    ).toBeTruthy();
  });

  /**
   * Requirement 4.3 — summary counts are displayed
   */
  it("displays total suggestion count in summary bar", () => {
    const result = makeAnalysisResult({
      suggestions: [
        { id: "1", title: "Add metrics", detail: "Use numbers", severity: "high", category: "impact" },
        { id: "2", title: "Fix grammar", detail: "Check spelling", severity: "low", category: "writing" },
      ],
    });
    renderStep(result);
    // Total count = 2
    const totals = screen.getAllByText("2");
    expect(totals.length).toBeGreaterThan(0);
  });

  it("displays critical suggestion count in summary bar", () => {
    const result = makeAnalysisResult({
      suggestions: [
        { id: "1", title: "Add metrics", detail: "Use numbers", severity: "high", category: "impact" },
        { id: "2", title: "Fix grammar", detail: "Check spelling", severity: "low", category: "writing" },
      ],
    });
    renderStep(result);
    // Critical count = 1 (only the "high" severity one)
    const ones = screen.getAllByText("1");
    expect(ones.length).toBeGreaterThan(0);
  });

  /**
   * Requirement 4.6 — matched and missing keyword counts are displayed
   */
  it("displays matched keyword count", () => {
    const result = makeAnalysisResult({ matchedKeywords: ["React", "TypeScript", "Node"] });
    renderStep(result);
    const threes = screen.getAllByText("3");
    expect(threes.length).toBeGreaterThan(0);
  });

  it("displays missing keyword count", () => {
    const result = makeAnalysisResult({ missingKeywords: ["GraphQL", "Docker"] });
    renderStep(result);
    const twos = screen.getAllByText("2");
    expect(twos.length).toBeGreaterThan(0);
  });

  /**
   * Requirement 4.2 — suggestion cards are rendered with title and detail
   */
  it("renders suggestion cards when suggestions are present", () => {
    const result = makeAnalysisResult({
      suggestions: [
        { id: "1", title: "Quantify achievements", detail: "Add numbers to your bullets", severity: "high", category: "impact" },
      ],
    });
    renderStep(result);
    expect(screen.getByText("Quantify achievements")).toBeTruthy();
    expect(screen.getByText("Add numbers to your bullets")).toBeTruthy();
  });

  /**
   * Requirement 6.2 — back navigation control is present and calls onBack
   */
  it("Back button calls onBack", async () => {
    const user = userEvent.setup();
    const { onBack } = renderStep();
    await user.click(screen.getByRole("button", { name: /back/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  /**
   * Enter Editor button calls onEnterEditor
   */
  it("Enter Editor button calls onEnterEditor", async () => {
    const user = userEvent.setup();
    const { onEnterEditor } = renderStep();
    await user.click(screen.getByRole("button", { name: /enter editor/i }));
    expect(onEnterEditor).toHaveBeenCalledTimes(1);
  });
});
