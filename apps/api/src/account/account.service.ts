import { ForbiddenException, Inject, Injectable } from "@nestjs/common";

import {
  ACCOUNT_USAGE_REPOSITORY,
  type AccountUsageRepository,
} from "./repositories/account-usage.repository.js";

/** Every account gets one AI check. */
export const ANALYSIS_QUOTA_LIMIT = 1;

export interface AnalysisQuota {
  limit: number;
  used: number;
  canAnalyze: boolean;
  analysisId: string | null;
  redeemedAt: string | null;
}

@Injectable()
export class AccountService {
  constructor(
    @Inject(ACCOUNT_USAGE_REPOSITORY)
    private readonly usage: AccountUsageRepository,
  ) {}

  async getAnalysisQuota(userId: string): Promise<AnalysisQuota> {
    const usage = await this.usage.findByUserId(userId);

    return {
      limit: ANALYSIS_QUOTA_LIMIT,
      used: usage ? 1 : 0,
      canAnalyze: !usage,
      analysisId: usage?.analysisId ?? null,
      redeemedAt: usage?.redeemedAt ?? null,
    };
  }

  /**
   * Throws when the account has already spent its check.
   *
   * Used by the analysis flow before it starts work, so a second attempt is
   * refused before any AI call is paid for.
   */
  async assertCanCreateAnalysis(userId: string): Promise<void> {
    if (await this.usage.findByUserId(userId)) {
      throw new ForbiddenException(
        "This account already used its one resume analysis. Open your saved check to review or update it.",
      );
    }
  }

  async recordAnalysisRedemption(userId: string, analysisId: string): Promise<void> {
    await this.usage.recordUsage(userId, analysisId);
  }
}
