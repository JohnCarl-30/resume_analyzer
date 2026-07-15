import { eq } from "drizzle-orm";

import { db } from "../db/client.js";
import { accountAnalysisUsageTable } from "../db/schema.js";
import type { AccountAnalysisUsage, AccountUsageRepository } from "./account-usage.repository.js";

class PostgresAccountUsageRepository implements AccountUsageRepository {
  async findByUserId(userId: string) {
    if (!db.client) {
      return null;
    }

    const [record] = await db.client
      .select()
      .from(accountAnalysisUsageTable)
      .where(eq(accountAnalysisUsageTable.userId, userId))
      .limit(1);

    return record
      ? {
          userId: record.userId,
          analysisId: record.analysisId,
          redeemedAt: record.redeemedAt,
        }
      : null;
  }

  async recordUsage(userId: string, analysisId: string) {
    if (!db.client) {
      throw new Error("Database client is not configured.");
    }

    const redeemedAt = new Date().toISOString();

    await db.client
      .insert(accountAnalysisUsageTable)
      .values({
        userId,
        analysisId,
        redeemedAt,
      })
      .onConflictDoNothing();

    return {
      userId,
      analysisId,
      redeemedAt,
    };
  }
}

export const postgresAccountUsageRepository = new PostgresAccountUsageRepository();
