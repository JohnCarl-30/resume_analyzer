export type AnalysisProgressPhase = "parsing" | "analyzing" | "saving";

export type AnalysisProgressMode = "upload" | "template" | "reanalyze";

export interface AnalysisProgressStep {
  phase: AnalysisProgressPhase;
  label: string;
  description: string;
}

const UPLOAD_STEPS: AnalysisProgressStep[] = [
  {
    phase: "parsing",
    label: "Parsing",
    description: "Reading text from your resume file…",
  },
  {
    phase: "analyzing",
    label: "Analyzing",
    description: "Matching keywords, scoring fit, and drafting suggestions…",
  },
  {
    phase: "saving",
    label: "Saving",
    description: "Storing your resume check…",
  },
];

const ANALYZE_AND_SAVE_STEPS: AnalysisProgressStep[] = [
  {
    phase: "analyzing",
    label: "Analyzing",
    description: "Matching keywords, scoring fit, and drafting suggestions…",
  },
  {
    phase: "saving",
    label: "Saving",
    description: "Storing your resume check…",
  },
];

export function getAnalysisProgressSteps(mode: AnalysisProgressMode): AnalysisProgressStep[] {
  if (mode === "upload") {
    return UPLOAD_STEPS;
  }

  return ANALYZE_AND_SAVE_STEPS;
}

/** Milliseconds after start when each subsequent step becomes active. */
export function getAnalysisProgressDelays(mode: AnalysisProgressMode): number[] {
  switch (mode) {
    case "upload":
      return [5_000, 45_000];
    case "template":
      return [8_000, 40_000];
    case "reanalyze":
      return [35_000];
  }
}
