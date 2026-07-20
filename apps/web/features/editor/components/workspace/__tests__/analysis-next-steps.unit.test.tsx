import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { AnalysisNextSteps } from "../analysis-next-steps";
import type { AnalysisNextStepsState } from "../../../view-models/analysis-next-steps";

const guide: AnalysisNextStepsState = {
  statusLabel: "Getting close",
  statusTone: "close",
  summary: "Start with these fixes before printing.",
  completedCount: 2,
  totalCount: 5,
  progress: 40,
  missingKeywordPreview: ["GraphQL", "TypeScript"],
  steps: [
    {
      id: "skills",
      title: "Add job words to Skills",
      description: "Use missing job words naturally.",
      complete: false,
      action: "skills",
      buttonLabel: "Edit section",
      applyLabel: "Add suggestion",
      applyDescription: "Add GraphQL to Skills so you can edit them in context.",
    },
  ],
};

describe("AnalysisNextSteps", () => {
  it("renders a tailor banner and calls onReview when clicked", () => {
    const onReview = vi.fn();

    render(
      <AnalysisNextSteps
        guide={guide}
        onAction={vi.fn()}
        onApply={vi.fn()}
        tailor={{
          isLoading: false,
          pendingCount: 2,
          onReview,
        }}
      />,
    );

    expect(screen.getByText("Job-tailored edits ready")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /review 2 edits/i }));
    expect(onReview).toHaveBeenCalledTimes(1);
  });

  it("shows a loading state in the tailor banner while edits are preparing", () => {
    render(
      <AnalysisNextSteps
        guide={guide}
        onAction={vi.fn()}
        tailor={{
          isLoading: true,
          pendingCount: 0,
          onReview: vi.fn(),
        }}
      />,
    );

    expect(screen.getByRole("button", { name: /preparing/i })).toBeDisabled();
    expect(screen.getByText(/preparing light edits/i)).toBeInTheDocument();
  });

  it("hides manual Add suggestion buttons when preferTailorFlow is true", () => {
    render(
      <AnalysisNextSteps
        guide={guide}
        onAction={vi.fn()}
        onApply={vi.fn()}
        preferTailorFlow
        tailor={{
          isLoading: false,
          pendingCount: 2,
          onReview: vi.fn(),
        }}
      />,
    );

    expect(screen.queryByRole("button", { name: /add suggestion for add job words to skills/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit section/i })).toBeInTheDocument();
  });
});
