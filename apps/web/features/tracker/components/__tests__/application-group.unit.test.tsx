import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApplicationGroup } from "../application-group";

describe("ApplicationGroup", () => {
  it("labels the group with its status and count", () => {
    render(
      <ApplicationGroup status="interviewing" count={3}>
        <p>rows</p>
      </ApplicationGroup>,
    );

    expect(screen.getByText("Interviewing")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("starts open so its applications are readable without a click", () => {
    const { container } = render(
      <ApplicationGroup status="applied" count={1}>
        <p>rows</p>
      </ApplicationGroup>,
    );

    expect(container.querySelector("details")).toHaveAttribute("open");
  });

  // Rejected applications are kept for the record, not for daily reading.
  it("can start collapsed", () => {
    const { container } = render(
      <ApplicationGroup status="rejected" count={2} defaultOpen={false}>
        <p>rows</p>
      </ApplicationGroup>,
    );

    expect(container.querySelector("details")).not.toHaveAttribute("open");
  });

  it("renders the applications it is given", () => {
    render(
      <ApplicationGroup status="offer" count={1}>
        <p>Backend Engineer at Acme</p>
      </ApplicationGroup>,
    );

    expect(screen.getByText("Backend Engineer at Acme")).toBeInTheDocument();
  });
});
