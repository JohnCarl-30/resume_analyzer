import { Injectable } from "@nestjs/common";

import type {
  AccountAnalysisUsage,
  AccountUsageRepository,
} from "./account-usage.repository.js";

/** Used when no database is configured. Usage resets when the process ends. */
@Injectable()
export class InMemoryAccountUsageRepository implements AccountUsageRepository {
  private readonly usageByUserId = new Map<string, AccountAnalysisUsage>();

  async findByUserId(userId: string): Promise<AccountAnalysisUsage | null> {
    return this.usageByUserId.get(userId) ?? null;
  }

  async recordUsage(userId: string, analysisId: string): Promise<AccountAnalysisUsage> {
    const existing = this.usageByUserId.get(userId);

    // The free check is once per account, so a second redemption keeps the
    // first rather than overwriting it.
    if (existing) {
      return existing;
    }

    const usage: AccountAnalysisUsage = {
      userId,
      analysisId,
      redeemedAt: new Date().toISOString(),
    };

    this.usageByUserId.set(userId, usage);
    return usage;
  }
}
