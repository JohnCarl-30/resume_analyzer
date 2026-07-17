"use client";

import { useCallback } from "react";

import { apiClient } from "@/lib/api-instance";

interface UseWorkspaceEnhanceOptions {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function useWorkspaceEnhance({ onSuccess, onError }: UseWorkspaceEnhanceOptions) {
  const enhanceBullets = useCallback(
    async (role: string, bullets: string[]) => {
      try {
        const enhanced = await apiClient.post<string[]>("/api/enhance/bullets", {
          role,
          bullets,
        });

        onSuccess("Added enhanced bullet suggestions.");
        return enhanced;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to enhance bullets right now.";
        onError(message);
        throw error;
      }
    },
    [onError, onSuccess],
  );

  return { enhanceBullets };
}
