"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { useAnalysisQuota } from "@/features/account/view-models/use-analysis-quota";
import { HomePageView } from "@/features/home/views/home-page-view";
import { getInitials } from "@/features/home/lib/home-display";
import { useResumeDashboard } from "@/features/resumes/view-models/use-resume-dashboard";
import {
  getAnalysisQuotaNavigationState,
  NEW_ANALYSIS_PATH,
  SCRATCH_BUILDER_PATH,
} from "@/lib/analysis-quota-navigation";

export function HomePageClient() {
  const router = useRouter();
  const { user, isLoaded: isProfileLoaded } = useUser();
  const { quota, error: quotaError, isLoading: quotaLoading, refetch } = useAnalysisQuota();
  const {
    resumes,
    isLoading: resumesLoading,
    error: resumesError,
    refetch: refetchResumes,
  } = useResumeDashboard();
  const quotaNav = getAnalysisQuotaNavigationState(quota, {
    isLoading: quotaLoading,
    error: quotaError,
  });

  const displayName =
    user?.fullName?.trim() ||
    user?.primaryEmailAddress?.emailAddress ||
    "Your account";
  const email = user?.primaryEmailAddress?.emailAddress;
  const initials = getInitials(displayName);

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
      isProfileLoaded={isProfileLoaded}
      displayName={displayName}
      email={email}
      initials={initials}
      resumes={resumes}
      resumesLoading={resumesLoading}
      resumesError={resumesError}
      onNewAnalysis={handleNewAnalysis}
      onScratchBuilder={handleScratchBuilder}
      onQuotaRetry={refetch}
      onResumesRetry={refetchResumes}
      onOpenAnalysis={(analysisId) => router.push(`/analysis/${analysisId}`)}
    />
  );
}
