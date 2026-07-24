"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { ResumeAnalysisResult } from "@/features/editor/model/resume-analysis";
import { getResumeAnalysis } from "@/features/onboarding/utils/analysis-api";
import { queryKeys } from "@/lib/query/keys";

export function useResumeAnalysis(analysisId: string | null | undefined) {
  const queryClient = useQueryClient();
  const id = analysisId?.trim() || null;

  const query = useQuery({
    queryKey: id ? queryKeys.analysis(id) : queryKeys.analysis("pending"),
    queryFn: () => getResumeAnalysis(id!),
    enabled: Boolean(id),
    placeholderData: () => {
      if (!id) {
        return undefined;
      }

      const list = queryClient.getQueryData<ResumeAnalysisResult[]>(queryKeys.analyses);
      return list?.find((analysis) => analysis.id === id);
    },
  });

  return {
    analysis: query.data ?? null,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Unable to load the saved resume check right now."
      : "",
    // No cached/placeholder data yet — show the Restoring screen.
    isLoading: Boolean(id) && query.isLoading,
    isFetching: query.isFetching,
    isPlaceholderData: query.isPlaceholderData,
    refetch: () => {
      void query.refetch();
    },
  };
}
