import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs", () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignOutButton: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useUser: () => ({
    isLoaded: true,
    user: {
      fullName: "Test User",
      primaryEmailAddress: { emailAddress: "test@example.com" },
    },
  }),
}));

import { HeaderAuthActions } from "../header-auth-actions";

describe("HeaderAuthActions", () => {
  it("renders sign-in and the custom account menu without Clerk UserButton", () => {
    render(<HeaderAuthActions />);

    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/auth/sign-in?next=%2Fhome",
    );
    expect(screen.getByRole("button", { name: /open account menu/i })).toBeInTheDocument();
    expect(screen.queryByTestId("user-button")).not.toBeInTheDocument();
  });
});
