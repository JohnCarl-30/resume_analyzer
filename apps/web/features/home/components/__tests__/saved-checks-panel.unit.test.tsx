import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { ResumeSummary } from "@/features/resumes/model/resume";
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

import { SavedChecksPanel } from "../saved-checks-panel";

const readyQuota = {
  limit: 1,
  used: 0,
  canAnalyze: true,
  analysisId: null,
  redeemedAt: null,
};

function renderPanel(overrides: Partial<Parameters<typeof SavedChecksPanel>[0]> = {}) {
  const props = {
    quotaNav: getAnalysisQuotaNavigationState(readyQuota),
    resumes: [] as ResumeSummary[],
    isLoading: false,
    error: "",
    onNewAnalysis: vi.fn(),
    onScratchBuilder: vi.fn(),
    onOpenAnalysis: vi.fn(),
    onRefetch: vi.fn(),
    ...overrides,
  };

  return { props, ...render(<SavedChecksPanel {...props} />) };
}

describe("SavedChecksPanel", () => {
  it("gives the empty state a way to start a check when one is available", async () => {
    const user = userEvent.setup();
    const { props } = renderPanel();

    const cta = screen.getByRole("button", { name: /upload resume/i });
    await user.click(cta);

    expect(props.onNewAnalysis).toHaveBeenCalledTimes(1);
  });

  it("falls back to the saved check and scratch builder once the quota is spent", () => {
    renderPanel({
      quotaNav: getAnalysisQuotaNavigationState({
        ...readyQuota,
        used: 1,
        canAnalyze: false,
        analysisId: "abc",
      }),
    });

    expect(screen.queryByRole("button", { name: /upload resume/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open saved check/i })).toHaveAttribute(
      "href",
      "/analysis/abc",
    );
    expect(screen.getByRole("button", { name: /build from scratch/i })).toBeInTheDocument();
  });

  it("opens the analysis behind a row", async () => {
    const user = userEvent.setup();
    const { props } = renderPanel({
      resumes: [
        {
          id: "r1",
          candidateName: "Alex Chen",
          fileName: "alex-chen.pdf",
          status: "analyzed",
          uploadedAt: "2026-08-01T00:00:00.000Z",
          targetRole: "Backend Engineer",
          score: 82,
          missingKeywordCount: 3,
          suggestionCount: 2,
        },
      ],
    });

    await user.click(screen.getByRole("button", { name: /open alex-chen\.pdf/i }));

    expect(props.onOpenAnalysis).toHaveBeenCalledWith("r1");
  });
});
