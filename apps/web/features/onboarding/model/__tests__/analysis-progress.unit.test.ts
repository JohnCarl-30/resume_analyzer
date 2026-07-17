import { describe, expect, it } from "vitest";

import {
  getAnalysisProgressDelays,
  getAnalysisProgressSteps,
} from "../analysis-progress";

describe("analysis progress model", () => {
  it("includes parsing for upload mode", () => {
    expect(getAnalysisProgressSteps("upload").map((step) => step.phase)).toEqual([
      "parsing",
      "analyzing",
      "saving",
    ]);
  });

  it("skips parsing for reanalyze mode", () => {
    expect(getAnalysisProgressSteps("reanalyze").map((step) => step.phase)).toEqual([
      "analyzing",
      "saving",
    ]);
  });

  it("uses longer delays for upload checks than reanalyze checks", () => {
    expect(getAnalysisProgressDelays("upload")).toEqual([5_000, 45_000]);
    expect(getAnalysisProgressDelays("reanalyze")).toEqual([35_000]);
  });
});
