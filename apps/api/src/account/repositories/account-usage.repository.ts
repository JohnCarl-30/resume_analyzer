export interface AccountAnalysisUsage {
  userId: string;
  analysisId: string;
  redeemedAt: string;
}

export interface AccountUsageRepository {
  findByUserId(userId: string): Promise<AccountAnalysisUsage | null>;
  recordUsage(userId: string, analysisId: string): Promise<AccountAnalysisUsage>;
}

/** Injection token: the implementation depends on whether Postgres is configured. */
export const ACCOUNT_USAGE_REPOSITORY = Symbol("ACCOUNT_USAGE_REPOSITORY");
