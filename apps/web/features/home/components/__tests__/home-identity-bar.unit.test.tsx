import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { getAnalysisQuotaNavigationState } from "@/lib/analysis-quota-navigation";

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

import { HomeIdentityBar } from "../home-identity-bar";

describe("HomeIdentityBar", () => {
  it("shows the workspace masthead and upload when a check is available", () => {
    const quota = {
      limit: 1,
      used: 0,
      canAnalyze: true,
      analysisId: null,
      redeemedAt: null,
    };
    const quotaNav = getAnalysisQuotaNavigationState(quota);
    const onNewAnalysis = vi.fn();

    render(
      <HomeIdentityBar
        quota={quota}
        quotaNav={quotaNav}
        quotaError=""
        isProfileLoaded
        displayName="Alex Example"
        email="alex@example.com"
        initials="AE"
        onNewAnalysis={onNewAnalysis}
        onScratchBuilder={vi.fn()}
        onQuotaRetry={vi.fn()}
      />,
    );

    expect(screen.getByText("Workspace")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /ready for your next match/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("alex@example.com")).toBeInTheDocument();
    expect(screen.getByText("Check ready")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /upload resume/i })).toBeEnabled();
    expect(screen.getByRole("link", { name: /account settings/i })).toHaveAttribute(
      "href",
      "/account",
    );
  });

  it("links to the saved check when the free check is used", () => {
    const quota = {
      limit: 1,
      used: 1,
      canAnalyze: false,
      analysisId: "analysis-42",
      redeemedAt: "2026-01-01T00:00:00.000Z",
    };
    const quotaNav = getAnalysisQuotaNavigationState(quota);

    render(
      <HomeIdentityBar
        quota={quota}
        quotaNav={quotaNav}
        quotaError=""
        isProfileLoaded
        displayName="Alex Example"
        email="alex@example.com"
        initials="AE"
        onNewAnalysis={vi.fn()}
        onScratchBuilder={vi.fn()}
        onQuotaRetry={vi.fn()}
      />,
    );

    expect(screen.getByText("Saved check")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /your check is saved/i })).toBeInTheDocument();
    expect(screen.getByText("Check used")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open saved check/i })).toHaveAttribute(
      "href",
      "/analysis/analysis-42",
    );
    expect(screen.getByRole("button", { name: /build from scratch/i })).toBeInTheDocument();
  });

  it("retries quota loading when plan status fails", async () => {
    const user = userEvent.setup();
    const onQuotaRetry = vi.fn();
    const quotaNav = getAnalysisQuotaNavigationState(null, {
      isLoading: false,
      error: "Could not load plan",
    });

    render(
      <HomeIdentityBar
        quota={null}
        quotaNav={quotaNav}
        quotaError="Could not load plan"
        isProfileLoaded
        displayName="Alex Example"
        email="alex@example.com"
        initials="AE"
        onNewAnalysis={vi.fn()}
        onScratchBuilder={vi.fn()}
        onQuotaRetry={onQuotaRetry}
      />,
    );

    expect(screen.getByText("Plan unavailable")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /plan status unavailable/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Could not load plan")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(onQuotaRetry).toHaveBeenCalledTimes(1);
  });
});
