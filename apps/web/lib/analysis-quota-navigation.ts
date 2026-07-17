import type { AnalysisQuota } from "@/lib/account-api";

export const SCRATCH_BUILDER_PATH = "/analysis/new?mode=scratch";
export const NEW_ANALYSIS_PATH = "/analysis/new";

export interface AnalysisQuotaNavigationOptions {
  isLoading?: boolean;
  error?: string;
}

export interface AnalysisQuotaNavigationState {
  isLoading: boolean;
  hasError: boolean;
  canUpload: boolean;
  canUseScratchBuilder: boolean;
  savedCheckPath: string | null;
  uploadBlockedMessage: string;
  exhaustedMessage: string;
}

export function getSavedCheckPath(quota: AnalysisQuota | null): string | null {
  return quota?.analysisId ? `/analysis/${quota.analysisId}` : null;
}

export function getAnalysisQuotaNavigationState(
  quota: AnalysisQuota | null,
  options: AnalysisQuotaNavigationOptions = {},
): AnalysisQuotaNavigationState {
  const isLoading = options.isLoading ?? false;
  const hasError = Boolean(options.error?.trim());
  const savedCheckPath = getSavedCheckPath(quota);

  const canUpload = !isLoading && !hasError && quota?.canAnalyze === true;
  const canUseScratchBuilder = !isLoading;

  const exhaustedMessage = savedCheckPath
    ? "Your free check is used. Open your saved check to review results, or start a blank draft below."
    : "Your free check is used. Start a blank draft below if you want to keep building.";

  const uploadBlockedMessage = hasError
    ? "We couldn't verify your plan status. Try again before uploading a resume for analysis."
    : quota?.canAnalyze === false
      ? "This account already used its one resume analysis."
      : "Loading your plan status…";

  return {
    isLoading,
    hasError,
    canUpload,
    canUseScratchBuilder,
    savedCheckPath,
    uploadBlockedMessage,
    exhaustedMessage,
  };
}
