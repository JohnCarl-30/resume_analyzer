"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getAnalysisProgressDelays,
  getAnalysisProgressSteps,
  type AnalysisProgressMode,
  type AnalysisProgressPhase,
  type AnalysisProgressStep,
} from "../model/analysis-progress";

export interface AnalysisProgressState {
  isActive: boolean;
  steps: AnalysisProgressStep[];
  activeStepIndex: number;
  phase: AnalysisProgressPhase;
}

export function useAnalysisProgress(
  isActive: boolean,
  mode: AnalysisProgressMode,
): AnalysisProgressState {
  const steps = useMemo(() => getAnalysisProgressSteps(mode), [mode]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setActiveStepIndex(0);
      return;
    }

    setActiveStepIndex(0);

    const delays = getAnalysisProgressDelays(mode);
    const timers = delays.map((delay, index) =>
      window.setTimeout(() => {
        setActiveStepIndex(Math.min(index + 1, steps.length - 1));
      }, delay),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isActive, mode, steps.length]);

  const phase = steps[Math.min(activeStepIndex, steps.length - 1)]?.phase ?? "analyzing";

  return {
    isActive,
    steps,
    activeStepIndex,
    phase,
  };
}
