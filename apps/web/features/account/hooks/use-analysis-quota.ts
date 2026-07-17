"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import { getAnalysisQuota, type AnalysisQuota } from "@/lib/account-api";

export function useAnalysisQuota() {
  const { isLoaded, isSignedIn } = useAuth();
  const [quota, setQuota] = useState<AnalysisQuota | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setQuota(null);
      setError("");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError("");

    void getAnalysisQuota()
      .then((nextQuota) => {
        if (!cancelled) {
          setQuota(nextQuota);
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setQuota(null);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Could not load your plan details.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, reloadToken]);

  return { quota, error, isLoading, refetch };
}
