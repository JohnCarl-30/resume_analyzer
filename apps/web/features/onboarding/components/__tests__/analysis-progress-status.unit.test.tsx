import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { AnalysisProgressStatus } from "../analysis-progress-status";

const steps = [
  {
    phase: "parsing" as const,
    label: "Parsing",
    description: "Reading text from your resume file…",
  },
  {
    phase: "analyzing" as const,
    label: "Analyzing",
    description: "Matching keywords, scoring fit, and drafting suggestions…",
  },
  {
    phase: "saving" as const,
    label: "Saving",
    description: "Storing your resume check…",
  },
];

describe("AnalysisProgressStatus", () => {
  it("shows the active stage name, description, and a progress bar", () => {
    render(<AnalysisProgressStatus steps={steps} activeStepIndex={1} />);

    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Running your resume check: Analyzing");
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "Analyzing");
    expect(
      screen.getByText("Matching keywords, scoring fit, and drafting suggestions…"),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Analyzing…");
    expect(screen.getByText("Parsing")).toBeInTheDocument();
    expect(screen.getByText("Saving")).toBeInTheDocument();
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("names the first stage while parsing", () => {
    render(<AnalysisProgressStatus steps={steps} activeStepIndex={0} />);

    expect(screen.getByRole("status")).toHaveTextContent("Parsing…");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "Parsing");
  });
});
