import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AnalysisProgressStatus } from "../analysis-progress-status";

describe("AnalysisProgressStatus", () => {
  it("shows the active step description and step labels", () => {
    render(
      <AnalysisProgressStatus
        steps={[
          {
            phase: "parsing",
            label: "Parsing",
            description: "Reading text from your resume file…",
          },
          {
            phase: "analyzing",
            label: "Analyzing",
            description: "Matching keywords, scoring fit, and drafting suggestions…",
          },
          {
            phase: "saving",
            label: "Saving",
            description: "Storing your resume check…",
          },
        ]}
        activeStepIndex={1}
      />,
    );

    expect(screen.getByRole("status")).toBeTruthy();
    expect(
      screen.getByText("Matching keywords, scoring fit, and drafting suggestions…"),
    ).toBeTruthy();
    expect(screen.getByText("Analyzing…")).toBeTruthy();
    expect(screen.getByText("Parsing")).toBeTruthy();
    expect(screen.getByText("Saving")).toBeTruthy();
  });
});
