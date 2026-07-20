import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { getAnalysisQuotaNavigationState } from "@/lib/analysis-quota-navigation";

vi.mock("@clerk/nextjs", () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignOutButton: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    getToken: vi.fn(),
    signOut: vi.fn(),
  }),
  useUser: () => ({
    isLoaded: true,
    user: { fullName: "Alex Example", primaryEmailAddress: { emailAddress: "alex@example.com" } },
  }),
}));

import { AppShellHeader } from "../app-shell-header";

describe("AppShellHeader", () => {
  it("renders app navigation and account actions", () => {
    const quotaNav = getAnalysisQuotaNavigationState({
      limit: 1,
      used: 0,
      canAnalyze: true,
      analysisId: null,
      redeemedAt: null,
    });

    render(<AppShellHeader active="home" quotaNav={quotaNav} />);

    expect(screen.getByRole("link", { name: /resumae/i })).toHaveAttribute("href", "/home");
    expect(screen.getByRole("link", { name: /^home$/i })).toHaveAttribute("href", "/home");
    expect(screen.getByRole("link", { name: /upload resume/i })).toHaveAttribute("href", "/analysis/new");
    expect(screen.getByRole("navigation", { name: /app navigation/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^account$/i })).toHaveAttribute("href", "/account");
    expect(screen.getByRole("button", { name: /open account menu/i })).toBeInTheDocument();
  });
});
