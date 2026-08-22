import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChipGroup } from "../chip-group";

describe("ChipGroup", () => {
  it("exposes the options as a labelled radio group", () => {
    render(
      <ChipGroup
        legend="How far along are you?"
        options={["Student or intern", "3–5 years"] as const}
        value={null}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("group", { name: /how far along are you/i })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("reports the chosen option", async () => {
    const onChange = vi.fn();
    render(
      <ChipGroup
        legend="How far along are you?"
        options={["Student or intern", "3–5 years"] as const}
        value={null}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole("radio", { name: "3–5 years" }));
    expect(onChange).toHaveBeenCalledWith("3–5 years");
  });

  it("marks the current value as checked", () => {
    render(
      <ChipGroup
        legend="How far along are you?"
        options={["Student or intern", "3–5 years"] as const}
        value="3–5 years"
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("radio", { name: "3–5 years" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Student or intern" })).not.toBeChecked();
  });

  it("supports options that carry a separate label", async () => {
    const onChange = vi.fn();
    render(
      <ChipGroup
        legend="What first?"
        options={[{ value: "check", label: "Check a resume I already have" }] as const}
        value={null}
        onChange={onChange}
      />,
    );

    await userEvent.click(screen.getByRole("radio", { name: /check a resume/i }));
    expect(onChange).toHaveBeenCalledWith("check");
  });
});
