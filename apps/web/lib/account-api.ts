import { apiClient } from "@/lib/api-instance";

export interface AnalysisQuota {
  limit: number;
  used: number;
  canAnalyze: boolean;
  analysisId: string | null;
  redeemedAt: string | null;
}

export async function getAnalysisQuota(): Promise<AnalysisQuota> {
  return apiClient.get<AnalysisQuota>("/api/account/analysis-quota");
}
