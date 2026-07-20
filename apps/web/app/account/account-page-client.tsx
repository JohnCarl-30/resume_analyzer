"use client";

import { useUser } from "@clerk/nextjs";

import { useAnalysisQuota } from "@/features/account/view-models/use-analysis-quota";
import { getAnalysisQuotaNavigationState } from "@/lib/analysis-quota-navigation";

import { AccountPageView } from "@/features/account/views/account-page-view";

export function AccountPageClient() {
  const { user, isLoaded: isProfileLoaded } = useUser();
  const { quota, error: quotaError, isLoading: quotaLoading } = useAnalysisQuota();
  const quotaNav = getAnalysisQuotaNavigationState(quota, {
    isLoading: quotaLoading,
    error: quotaError,
  });

  const displayName =
    user?.fullName?.trim() ||
    user?.primaryEmailAddress?.emailAddress ||
    "Your account";
  const email = user?.primaryEmailAddress?.emailAddress;

  return (
    <AccountPageView
      quota={quota}
      quotaError={quotaError}
      quotaNav={quotaNav}
      isProfileLoaded={isProfileLoaded}
      displayName={displayName}
      email={email}
    />
  );
}
