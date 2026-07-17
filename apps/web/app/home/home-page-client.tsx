"use client";

import { useRouter } from "next/navigation";

import { useAnalysisQuota } from "@/features/account/hooks/use-analysis-quota";
import { HomePageView } from "@/features/home/views/home-page-view";
import {
  getAnalysisQuotaNavigationState,
  NEW_ANALYSIS_PATH,
  SCRATCH_BUILDER_PATH,
} from "@/lib/analysis-quota-navigation";

export function HomePageClient() {
  const router = useRouter();
  const { quota, error: quotaError, isLoading: quotaLoading, refetch } = useAnalysisQuota();
  const quotaNav = getAnalysisQuotaNavigationState(quota, {
    isLoading: quotaLoading,
    error: quotaError,
  });

  function handleNewAnalysis() {
    if (quotaNav.canUpload) {
      router.push(NEW_ANALYSIS_PATH);
      return;
    }

    if (quotaNav.savedCheckPath) {
      router.push(quotaNav.savedCheckPath);
      return;
    }

    router.push(SCRATCH_BUILDER_PATH);
  }

  function handleScratchBuilder() {
    router.push(SCRATCH_BUILDER_PATH);
  }

  return (
    <HomePageView
      quota={quota}
      quotaNav={quotaNav}
      quotaError={quotaError}
      onNewAnalysis={handleNewAnalysis}
      onScratchBuilder={handleScratchBuilder}
      onQuotaRetry={refetch}
      onOpenAnalysis={(analysisId) => router.push(`/analysis/${analysisId}`)}
    />
  );
}
