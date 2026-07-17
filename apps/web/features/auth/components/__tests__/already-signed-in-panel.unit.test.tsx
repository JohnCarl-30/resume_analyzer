import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs", () => ({
  SignOutButton: ({
    children,
  }: {
    children: React.ReactNode;
    signOutOptions?: { redirectUrl?: string };
  }) => <div data-testid="sign-out-button">{children}</div>,
  useUser: () => ({
    user: {
      primaryEmailAddress: { emailAddress: "alex@example.com" },
    },
  }),
}));

import { AlreadySignedInPanel } from "../already-signed-in-panel";

describe("AlreadySignedInPanel", () => {
  it("shows the signed-in email and actions instead of auto-redirecting", () => {
    render(<AlreadySignedInPanel redirectPath="/analysis/new" />);

    expect(screen.getByText((_, element) => element?.textContent === "You're already signed in as alex@example.com.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continue to resume check/i })).toHaveAttribute(
      "href",
      "/analysis/new",
    );
    expect(screen.getByRole("button", { name: /use another account/i })).toBeInTheDocument();
  });
});
