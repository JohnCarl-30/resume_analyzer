export interface AccountAnalysisUsage {
  userId: string;
  analysisId: string;
  redeemedAt: string;
}

export interface AccountUsageRepository {
  findByUserId(userId: string): Promise<AccountAnalysisUsage | null>;
  recordUsage(userId: string, analysisId: string): Promise<AccountAnalysisUsage>;
}
