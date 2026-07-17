import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useAnalysisProgress } from "../use-analysis-progress";

describe("useAnalysisProgress", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts on parsing for upload mode and advances through timed steps", () => {
    const { result, rerender } = renderHook(
      ({ isActive, mode }) => useAnalysisProgress(isActive, mode),
      {
        initialProps: { isActive: false, mode: "upload" as const },
      },
    );

    expect(result.current.steps).toHaveLength(3);
    expect(result.current.phase).toBe("parsing");

    rerender({ isActive: true, mode: "upload" });
    expect(result.current.activeStepIndex).toBe(0);
    expect(result.current.phase).toBe("parsing");

    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current.activeStepIndex).toBe(1);
    expect(result.current.phase).toBe("analyzing");

    act(() => {
      vi.advanceTimersByTime(40_000);
    });
    expect(result.current.activeStepIndex).toBe(2);
    expect(result.current.phase).toBe("saving");
  });

  it("uses analyze-and-save steps for reanalyze mode", () => {
    const { result, rerender } = renderHook(
      ({ isActive }) => useAnalysisProgress(isActive, "reanalyze"),
      {
        initialProps: { isActive: true },
      },
    );

    rerender({ isActive: true });
    expect(result.current.steps).toHaveLength(2);
    expect(result.current.phase).toBe("analyzing");
  });
});
