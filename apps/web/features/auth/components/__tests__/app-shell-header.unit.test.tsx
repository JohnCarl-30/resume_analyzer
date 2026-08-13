import { render, screen, within } from "@testing-library/react";
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

const readyQuota = {
  limit: 1,
  used: 0,
  canAnalyze: true,
  analysisId: null,
  redeemedAt: null,
};

function renderHeader(active?: "home" | "new" | "tracker" | "settings") {
  const quotaNav = getAnalysisQuotaNavigationState(readyQuota);
  return render(<AppShellHeader active={active} quotaNav={quotaNav} />);
}

// The wide-screen nav and the small-screen tab strip are both in the DOM; CSS
// display:none decides which one a given viewport exposes.
function navs() {
  return screen.getAllByRole("navigation", { name: /app navigation/i });
}

function linksIn(nav: HTMLElement) {
  return within(nav)
    .getAllByRole("link")
    .map((link) => `${link.textContent}:${link.getAttribute("href")}`);
}

describe("AppShellHeader", () => {
  it("renders app navigation and account actions", () => {
    renderHeader("home");

    expect(screen.getByRole("link", { name: /resumae/i })).toHaveAttribute("href", "/home");

    const wideNav = within(navs()[0]);
    expect(wideNav.getByRole("link", { name: /^home$/i })).toHaveAttribute("href", "/home");
    expect(wideNav.getByRole("link", { name: /upload resume/i })).toHaveAttribute(
      "href",
      "/analysis/new",
    );
    expect(wideNav.getByRole("link", { name: /^account$/i })).toHaveAttribute("href", "/account");

    expect(screen.getByRole("button", { name: /open account menu/i })).toBeInTheDocument();
  });

  it("offers a skip link that targets the page's main content", () => {
    renderHeader("home");

    expect(screen.getByRole("link", { name: /skip to main content/i })).toHaveAttribute(
      "href",
      "#main-content",
    );
  });

  it("renders a second nav so small screens are not left without navigation", () => {
    renderHeader("home");

    expect(navs()).toHaveLength(2);

    for (const nav of navs()) {
      const labels = within(nav)
        .getAllByRole("link")
        .map((link) => link.textContent);
      expect(labels).toEqual(["Home", "Upload resume", "Applications", "Account"]);
    }
  });

  it("marks the active destination in every nav", () => {
    renderHeader("tracker");

    for (const nav of navs()) {
      expect(within(nav).getByRole("link", { current: "page" })).toHaveTextContent("Applications");
    }
  });

  it("keeps both navs pointing at the same destinations when the quota is spent", () => {
    const quotaNav = getAnalysisQuotaNavigationState({
      ...readyQuota,
      used: 1,
      canAnalyze: false,
      analysisId: "abc",
    });
    render(<AppShellHeader active="home" quotaNav={quotaNav} />);

    const [wide, compact] = navs().map(linksIn);

    expect(wide).toEqual(compact);
    expect(wide).toContain("Saved check:/analysis/abc");
  });
});
