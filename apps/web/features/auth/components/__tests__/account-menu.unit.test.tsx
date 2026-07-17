import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("@clerk/nextjs", () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignOutButton: ({
    children,
    signOutOptions,
  }: {
    children: React.ReactNode;
    signOutOptions?: { redirectUrl?: string };
  }) => (
    <button type="button" data-testid="sign-out-button" data-redirect={signOutOptions?.redirectUrl}>
      {children}
    </button>
  ),
  useUser: () => ({
    isLoaded: true,
    user: {
      fullName: "Alex Example",
      primaryEmailAddress: { emailAddress: "alex@example.com" },
    },
  }),
}));

import { AccountMenu } from "../account-menu";

describe("AccountMenu", () => {
  it("opens account dropdown with navigation and sign out", async () => {
    const user = userEvent.setup();
    render(<AccountMenu />);

    expect(screen.getByRole("button", { name: /open account menu/i })).toHaveTextContent("AE");

    await user.click(screen.getByRole("button", { name: /open account menu/i }));

    expect(screen.getByText("Alex Example")).toBeInTheDocument();
    expect(screen.getByText("alex@example.com")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /home/i })).toHaveAttribute("href", "/home");
    expect(screen.getByRole("menuitem", { name: /^account$/i })).toHaveAttribute(
      "href",
      "/account",
    );
    expect(screen.getByTestId("sign-out-button")).toHaveAttribute(
      "data-redirect",
      "/auth/sign-in",
    );
    expect(screen.getByTestId("sign-out-button")).toHaveTextContent("Sign out");
  });
});
