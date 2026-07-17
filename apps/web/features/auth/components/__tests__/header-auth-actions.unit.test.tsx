import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs", () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  UserButton: () => <div data-testid="user-button" />,
}));

import { HeaderAuthActions } from "../header-auth-actions";

describe("HeaderAuthActions", () => {
  it("renders sign-in and signed-in actions", () => {
    render(<HeaderAuthActions />);

    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/auth/sign-in?next=%2Fhome",
    );
    expect(screen.getByRole("link", { name: /my resumes/i })).toHaveAttribute("href", "/home");
    expect(screen.getByTestId("user-button")).toBeInTheDocument();
  });
});
