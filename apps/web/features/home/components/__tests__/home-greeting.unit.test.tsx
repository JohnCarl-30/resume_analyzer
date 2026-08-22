import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { getAnalysisQuotaNavigationState } from "@/lib/analysis-quota-navigation";

import { HomeGreeting } from "../home-greeting";

const READY_QUOTA = { limit: 1, used: 0, canAnalyze: true, analysisId: null };
const SPENT_QUOTA = { limit: 1, used: 1, canAnalyze: false, analysisId: "analysis-1" };

function renderGreeting(overrides: Partial<Parameters<typeof HomeGreeting>[0]> = {}) {
  const quota = overrides.quota === undefined ? READY_QUOTA : overrides.quota;

  return render(
    <HomeGreeting
      quota={quota}
      quotaNav={getAnalysisQuotaNavigationState(quota, false, Boolean(overrides.quotaError))}
      quotaError=""
      isProfileLoaded
      displayName="Jane Doe"
      email="jane@example.com"
      initials="JD"
      onQuotaRetry={vi.fn()}
      {...overrides}
    />,
  );
}

describe("HomeGreeting", () => {
  it("greets the signed-in person by first name", () => {
    renderGreeting();

    expect(screen.getByRole("heading", { name: /welcome back, jane/i })).toBeInTheDocument();
    expect(screen.getByText("jane@example.com")).toBeInTheDocument();
  });

  it("reports a check as ready and shows usage", () => {
    renderGreeting();

    expect(screen.getByText("Check ready")).toBeInTheDocument();
    expect(screen.getByText("0/1 checks used")).toBeInTheDocument();
  });

  it("reports a spent check", () => {
    renderGreeting({ quota: SPENT_QUOTA });

    expect(screen.getByText("Check used")).toBeInTheDocument();
    expect(screen.getByText("1/1 checks used")).toBeInTheDocument();
  });

  it("retries quota loading when plan status fails", async () => {
    const onQuotaRetry = vi.fn();
    renderGreeting({ quotaError: "Plan status is unavailable.", onQuotaRetry });

    expect(screen.getByRole("alert")).toHaveTextContent("Plan status is unavailable.");
    await userEvent.click(screen.getByRole("button", { name: /try again/i }));

    expect(onQuotaRetry).toHaveBeenCalledTimes(1);
  });

  it("shows a skeleton until the profile has loaded", () => {
    renderGreeting({ isProfileLoaded: false });

    expect(screen.queryByRole("heading", { name: /welcome back/i })).not.toBeInTheDocument();
  });
});
