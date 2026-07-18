import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockUseSearchParams = vi.fn();
let signedIn = false;

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockUseSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@clerk/nextjs", () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => (signedIn ? <>{children}</> : null),
  SignedOut: ({ children }: { children: React.ReactNode }) => (signedIn ? null : <>{children}</>),
  SignIn: (props: {
    path?: string;
    forceRedirectUrl?: string;
    signInUrl?: string;
    signUpUrl?: string;
  }) => (
    <div
      data-testid="clerk-sign-in"
      data-path={props.path}
      data-force-redirect={props.forceRedirectUrl}
      data-sign-in-url={props.signInUrl}
      data-sign-up-url={props.signUpUrl}
    />
  ),
  SignUp: () => <div data-testid="clerk-sign-up" />,
  SignOutButton: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sign-out-button">{children}</div>
  ),
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: signedIn,
    signOut: vi.fn(),
  }),
  useUser: () => ({
    user: {
      primaryEmailAddress: { emailAddress: "alex@example.com" },
    },
  }),
}));

import { ClerkAuthShell } from "../clerk-auth-shell";

describe("ClerkAuthShell sign-in", () => {
  beforeEach(() => {
    signedIn = false;
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  it("shows welcome copy and mounts Clerk sign-in for signed-out users", () => {
    render(<ClerkAuthShell mode="sign-in" />);

    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(
      screen.getByText(/sign in to run your resume check against a job post/i),
    ).toBeInTheDocument();

    const signIn = screen.getByTestId("clerk-sign-in");
    expect(signIn).toHaveAttribute("data-path", "/auth/sign-in");
    expect(signIn).toHaveAttribute("data-force-redirect", "/home");
    expect(signIn).toHaveAttribute("data-sign-up-url", "/auth/sign-up");
    expect(screen.getByRole("link", { name: /^sign up$/i })).toHaveAttribute(
      "href",
      "/auth/sign-up?next=%2Fhome",
    );
    expect(screen.getByRole("link", { name: /back to marketing home/i })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.queryByTestId("clerk-sign-up")).not.toBeInTheDocument();
  });

  it("passes a safe next path as the Clerk force redirect", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("next=/analysis/new"));

    render(<ClerkAuthShell mode="sign-in" />);

    expect(screen.getByTestId("clerk-sign-in")).toHaveAttribute(
      "data-force-redirect",
      "/analysis/new",
    );
  });

  it("rejects unsafe next values and falls back to home", () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("next=https://evil.example"));

    render(<ClerkAuthShell mode="sign-in" />);

    expect(screen.getByTestId("clerk-sign-in")).toHaveAttribute("data-force-redirect", "/home");
  });

  it("shows the already-signed-in panel instead of the Clerk form", () => {
    signedIn = true;
    mockUseSearchParams.mockReturnValue(new URLSearchParams("next=/analysis/new"));

    render(<ClerkAuthShell mode="sign-in" />);

    expect(screen.queryByTestId("clerk-sign-in")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /you're signed in/i })).toBeInTheDocument();
    expect(screen.getByText("alex@example.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continue to resume check/i })).toHaveAttribute(
      "href",
      "/analysis/new",
    );
  });
});
