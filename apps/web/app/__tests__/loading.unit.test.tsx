import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import Loading from "../loading";

describe("Loading page", () => {
  it("renders the workspace loading state", () => {
    render(<Loading />);

    expect(screen.getByText(/loading your resume workspace/i)).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
