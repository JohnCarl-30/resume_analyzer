/**
 * Unit Tests — StepJobDescription
 *
 * Feature: resume-editor-flow
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.5
 */

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepJobDescription } from "../step-job-description";

function renderStep(jobDescription: string, canContinue?: boolean) {
  const derived = canContinue ?? jobDescription.trim().length >= 30;
  const setJobDescription = vi.fn();
  const onNext = vi.fn();
  render(
    <StepJobDescription
      jobDescription={jobDescription}
      setJobDescription={setJobDescription}
      onNext={onNext}
      canContinue={derived}
    />,
  );
  return { setJobDescription, onNext };
}

describe("StepJobDescription unit tests", () => {
  /**
   * Requirement 1.1 — first step indicator
   */
  it("renders STEP 1 OF 4 step indicator", () => {
    renderStep("");
    expect(screen.getByText("STEP 1 OF 4")).toBeTruthy();
  });

  /**
   * Requirement 1.2 — continue disabled when input is empty
   */
  it("Continue button is disabled when job description is empty", () => {
    renderStep("");
    const btn = screen.getByRole("button", { name: /continue to resume upload/i });
    expect(btn).toBeDisabled();
  });

  /**
   * Requirement 1.3 — inline error shown for 1–29 chars; no error on empty
   */
  it("shows no error message when input is empty", () => {
    renderStep("");
    expect(
      screen.queryByText(/paste at least 30 characters/i),
    ).toBeNull();
  });

  it("shows error message when input has fewer than 30 characters (1 char)", () => {
    renderStep("a");
    expect(
      screen.getByText(/paste at least 30 characters/i),
    ).toBeTruthy();
  });

  it("shows error message when input has 29 characters", () => {
    renderStep("a".repeat(29));
    expect(
      screen.getByText(/paste at least 30 characters/i),
    ).toBeTruthy();
  });

  /**
   * Requirement 1.2 — continue enabled at exactly 30 chars
   */
  it("Continue button is enabled at exactly 30 characters", () => {
    renderStep("a".repeat(30));
    const btn = screen.getByRole("button", { name: /continue to resume upload/i });
    expect(btn).not.toBeDisabled();
  });

  /**
   * Requirement 1.3 — no error shown when input meets the 30-char threshold
   */
  it("shows no error message when input has exactly 30 characters", () => {
    renderStep("a".repeat(30));
    expect(
      screen.queryByText(/paste at least 30 characters/i),
    ).toBeNull();
  });

  /**
   * Requirement 1.5 — live character count displayed
   */
  it("displays the trimmed character count", () => {
    renderStep("hello");
    expect(screen.getByText("5 characters")).toBeTruthy();
  });
});
