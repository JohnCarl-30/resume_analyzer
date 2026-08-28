import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { WizardProgress } from "../wizard-progress";

const STEPS = ["Job title", "Paste job post", "Add resume", "Pick a style", "Review"] as const;

describe("WizardProgress", () => {
  it("names the current step and the one after it", () => {
    render(<WizardProgress current={3} steps={STEPS} />);

    expect(screen.getByText(/Step 3 of 5 · Add resume/)).toBeInTheDocument();
    expect(screen.getByText(/Next: Pick a style/)).toBeInTheDocument();
  });

  it("offers no next step on the last one", () => {
    render(<WizardProgress current={5} steps={STEPS} />);

    expect(screen.getByText(/Step 5 of 5 · Review/)).toBeInTheDocument();
    expect(screen.queryByText(/Next:/)).not.toBeInTheDocument();
  });

  it("marks the current step for assistive technology", () => {
    render(<WizardProgress current={2} steps={STEPS} />);

    const current = document.querySelector('[aria-current="step"]');
    expect(current).toHaveTextContent("Paste job post");
  });

  // The bars this replaced coloured completed and current steps identically,
  // so the indicator showed progress without showing position.
  it("distinguishes completed steps from the current one", () => {
    render(<WizardProgress current={3} steps={STEPS} />);

    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");

    // Steps one and two are done, so they carry a check rather than a number.
    expect(items[0]).not.toHaveTextContent("1");
    expect(items[1]).not.toHaveTextContent("2");
    expect(items[2]).toHaveTextContent("3");
    expect(items[3]).toHaveTextContent("4");
  });

  it("reports position on the progress bar", () => {
    render(<WizardProgress current={4} steps={STEPS} />);

    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "4");
    expect(bar).toHaveAttribute("aria-valuemax", "5");
    expect(bar).toHaveAccessibleName();
  });
});
