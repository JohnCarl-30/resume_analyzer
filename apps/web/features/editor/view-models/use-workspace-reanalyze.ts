"use client";

import { useCallback, useEffect, useState } from "react";

import { useAnalysisProgress } from "../../onboarding/view-models/use-analysis-progress";
import { updateResumeAnalysis } from "../../onboarding/utils/analysis-api";
import type { ResumeAnalysisResult } from "../model/resume-analysis";

interface UseWorkspaceReanalyzeOptions {
  analysisId?: string;
  targetRole: string;
  initialJobDescription: string;
  onAnalysisUpdate?: (result: ResumeAnalysisResult) => void;
  onJobDescriptionChange?: (jobDescription: string) => void;
  onComplete?: () => void;
}

export function useWorkspaceReanalyze({
  analysisId,
  targetRole,
  initialJobDescription,
  onAnalysisUpdate,
  onJobDescriptionChange,
  onComplete,
}: UseWorkspaceReanalyzeOptions) {
  const [newJobDescription, setNewJobDescriptionState] = useState(initialJobDescription);
  const [isUpdatingAnalysis, setIsUpdatingAnalysis] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const reanalyzeProgress = useAnalysisProgress(isUpdatingAnalysis, "reanalyze");

  useEffect(() => {
    setNewJobDescriptionState(initialJobDescription);
  }, [initialJobDescription]);

  const setNewJobDescription = useCallback(
    (value: string) => {
      setNewJobDescriptionState(value);
      onJobDescriptionChange?.(value);
    },
    [onJobDescriptionChange],
  );

  const tailorToJob = useCallback(async () => {
    if (!analysisId || newJobDescription.trim().length < 30) {
      return;
    }

    setIsUpdatingAnalysis(true);
    setUpdateError("");

    try {
      const updated = await updateResumeAnalysis(analysisId, {
        jobDescription: newJobDescription,
        targetRole,
      });
      onAnalysisUpdate?.(updated);
      onComplete?.();
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Failed to update this resume check.",
      );
    } finally {
      setIsUpdatingAnalysis(false);
    }
  }, [analysisId, newJobDescription, onAnalysisUpdate, onComplete, targetRole]);

  return {
    newJobDescription,
    setNewJobDescription,
    isUpdatingAnalysis,
    updateError,
    reanalyzeProgress,
    tailorToJob,
  };
}
