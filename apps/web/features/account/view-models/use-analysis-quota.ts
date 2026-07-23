"use client";

import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { getAnalysisQuota } from "@/lib/account-api";
import { queryKeys } from "@/lib/query/keys";

export function useAnalysisQuota() {
  const { isLoaded, isSignedIn } = useAuth();

  const query = useQuery({
    queryKey: queryKeys.analysisQuota,
    queryFn: getAnalysisQuota,
    enabled: isLoaded && Boolean(isSignedIn),
  });

  return {
    quota: query.data ?? null,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Could not load your plan details."
      : "",
    isLoading: !isLoaded || (Boolean(isSignedIn) && query.isPending),
    refetch: () => {
      void query.refetch();
    },
  };
}
