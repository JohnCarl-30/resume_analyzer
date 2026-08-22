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

import { HomeActionTiles } from "../home-action-tiles";

const READY_QUOTA = { limit: 1, used: 0, canAnalyze: true, analysisId: null };
const SPENT_QUOTA = { limit: 1, used: 1, canAnalyze: false, analysisId: "analysis-1" };

describe("HomeActionTiles", () => {
  it("offers a new check while one is available", async () => {
    const onNewAnalysis = vi.fn();
    render(
      <HomeActionTiles
        quotaNav={getAnalysisQuotaNavigationState(READY_QUOTA, false, false)}
        onNewAnalysis={onNewAnalysis}
        onScratchBuilder={vi.fn()}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /check my resume/i }));
    expect(onNewAnalysis).toHaveBeenCalledTimes(1);
  });

  it("points at the saved check once the free check is used", () => {
    render(
      <HomeActionTiles
        quotaNav={getAnalysisQuotaNavigationState(SPENT_QUOTA, false, false)}
        onNewAnalysis={vi.fn()}
        onScratchBuilder={vi.fn()}
      />,
    );

    expect(screen.getByRole("link", { name: /open saved check/i })).toHaveAttribute(
      "href",
      "/analysis/analysis-1",
    );
    expect(screen.queryByRole("button", { name: /check my resume/i })).not.toBeInTheDocument();
  });

  it("always offers account settings", () => {
    render(
      <HomeActionTiles
        quotaNav={getAnalysisQuotaNavigationState(READY_QUOTA, false, false)}
        onNewAnalysis={vi.fn()}
        onScratchBuilder={vi.fn()}
      />,
    );

    expect(screen.getByRole("link", { name: /account settings/i })).toHaveAttribute(
      "href",
      "/account",
    );
  });

  it("starts the scratch builder", async () => {
    const onScratchBuilder = vi.fn();
    render(
      <HomeActionTiles
        quotaNav={getAnalysisQuotaNavigationState(READY_QUOTA, false, false)}
        onNewAnalysis={vi.fn()}
        onScratchBuilder={onScratchBuilder}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: /build from scratch/i }));
    expect(onScratchBuilder).toHaveBeenCalledTimes(1);
  });
});
