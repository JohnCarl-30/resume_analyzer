import type { AccountAnalysisUsage, AccountUsageRepository } from "./account-usage.repository.js";

class InMemoryAccountUsageRepository implements AccountUsageRepository {
  private readonly usageByUserId = new Map<string, AccountAnalysisUsage>();

  async findByUserId(userId: string) {
    return this.usageByUserId.get(userId) ?? null;
  }

  async recordUsage(userId: string, analysisId: string) {
    const usage: AccountAnalysisUsage = {
      userId,
      analysisId,
      redeemedAt: new Date().toISOString(),
    };

    this.usageByUserId.set(userId, usage);
    return usage;
  }
}

export const inMemoryAccountUsageRepository = new InMemoryAccountUsageRepository();
