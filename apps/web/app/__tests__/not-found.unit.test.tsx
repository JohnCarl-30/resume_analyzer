import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import NotFound from "../not-found";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("NotFound page", () => {
  it("renders recovery links for create and home", () => {
    render(<NotFound />);

    expect(screen.getByRole("heading", { name: /page not found/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create resume/i })).toHaveAttribute("href", "/create-resume");
    expect(screen.getByRole("link", { name: /^home$/i })).toHaveAttribute("href", "/home");
  });
});
