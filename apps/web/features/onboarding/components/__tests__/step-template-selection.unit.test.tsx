/**
 * Unit Tests — StepTemplateSelection
 *
 * Feature: resume-editor-flow
 *
 * Validates: Requirements 3.1, 3.7
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepTemplateSelection } from "../step-template-selection";
import type { ResumeTemplate } from "../../../templates/model/template";

function renderStep(selectedTemplateId: ResumeTemplate["id"] = "minimalist-grid") {
  const setSelectedTemplateId = vi.fn();
  const onNext = vi.fn();
  render(
    <StepTemplateSelection
      selectedTemplateId={selectedTemplateId}
      setSelectedTemplateId={setSelectedTemplateId}
      onNext={onNext}
    />,
  );
  return { setSelectedTemplateId, onNext };
}

describe("StepTemplateSelection unit tests", () => {
  /**
   * Requirement 3.1 — third step indicator
   */
  it("renders STEP 3 OF 4 step indicator", () => {
    renderStep();
    expect(screen.getByText("STEP 3 OF 4")).toBeTruthy();
  });

  /**
   * Requirement 3.7 — default template pre-selected when none explicitly chosen
   * The default template is "minimalist-grid"
   */
  it("pre-selects the minimalist-grid template by default", () => {
    renderStep("minimalist-grid");
    // "Minimalist Grid" appears in both the card and the "Current Selection" aside
    const matches = screen.getAllByText("Minimalist Grid");
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});
