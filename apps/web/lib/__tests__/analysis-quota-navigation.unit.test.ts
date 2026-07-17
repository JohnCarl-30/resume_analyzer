import { describe, expect, it } from "vitest";

import {
  getAnalysisQuotaNavigationState,
  getSavedCheckPath,
  SCRATCH_BUILDER_PATH,
} from "../analysis-quota-navigation";

describe("analysis-quota-navigation", () => {
  it("allows upload when quota is available", () => {
    const state = getAnalysisQuotaNavigationState({
      limit: 1,
      used: 0,
      canAnalyze: true,
      analysisId: null,
      redeemedAt: null,
    });

    expect(state.canUpload).toBe(true);
    expect(state.canUseScratchBuilder).toBe(true);
    expect(state.savedCheckPath).toBeNull();
  });

  it("blocks upload but allows scratch builder when quota is exhausted", () => {
    const state = getAnalysisQuotaNavigationState(
      {
        limit: 1,
        used: 1,
        canAnalyze: false,
        analysisId: "saved-123",
        redeemedAt: "2026-01-01T00:00:00.000Z",
      },
      { isLoading: false },
    );

    expect(state.canUpload).toBe(false);
    expect(state.canUseScratchBuilder).toBe(true);
    expect(state.savedCheckPath).toBe("/analysis/saved-123");
    expect(state.exhaustedMessage).toContain("saved check");
  });

  it("blocks upload when quota fetch failed", () => {
    const state = getAnalysisQuotaNavigationState(null, {
      isLoading: false,
      error: "Could not load plan",
    });

    expect(state.canUpload).toBe(false);
    expect(state.hasError).toBe(true);
    expect(state.uploadBlockedMessage).toContain("verify your plan status");
  });

  it("blocks upload while quota is loading", () => {
    const state = getAnalysisQuotaNavigationState(null, { isLoading: true });

    expect(state.canUpload).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it("exports scratch builder path", () => {
    expect(SCRATCH_BUILDER_PATH).toBe("/analysis/new?mode=scratch");
    expect(getSavedCheckPath({ limit: 1, used: 1, canAnalyze: false, analysisId: "abc", redeemedAt: null })).toBe(
      "/analysis/abc",
    );
  });
});
