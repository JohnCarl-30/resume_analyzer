import { db } from "../db/client.js";
import { inMemoryAccountUsageRepository } from "../repositories/in-memory-account-usage.repository.js";
import { postgresAccountUsageRepository } from "../repositories/postgres-account-usage.repository.js";
import { HttpError } from "../utils/http-error.js";

export const ANALYSIS_QUOTA_LIMIT = 1;

const accountUsageRepository = db.isConfigured
  ? postgresAccountUsageRepository
  : inMemoryAccountUsageRepository;

export const accountService = {
  async getAnalysisQuota(userId: string) {
    const usage = await accountUsageRepository.findByUserId(userId);

    return {
      limit: ANALYSIS_QUOTA_LIMIT,
      used: usage ? 1 : 0,
      canAnalyze: !usage,
      analysisId: usage?.analysisId ?? null,
      redeemedAt: usage?.redeemedAt ?? null,
    };
  },

  async assertCanCreateAnalysis(userId: string) {
    const usage = await accountUsageRepository.findByUserId(userId);

    if (usage) {
      throw new HttpError(
        403,
        "This account already used its one resume analysis. Open your saved check to review or update it.",
      );
    }
  },

  async recordAnalysisRedemption(userId: string, analysisId: string) {
    await accountUsageRepository.recordUsage(userId, analysisId);
  },
};
