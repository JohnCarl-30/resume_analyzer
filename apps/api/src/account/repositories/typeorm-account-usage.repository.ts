import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { AccountAnalysisUsageEntity } from "../../database/entities/account-analysis-usage.entity.js";
import type {
  AccountAnalysisUsage,
  AccountUsageRepository,
} from "./account-usage.repository.js";

@Injectable()
export class TypeOrmAccountUsageRepository implements AccountUsageRepository {
  constructor(
    @InjectRepository(AccountAnalysisUsageEntity)
    private readonly usage: Repository<AccountAnalysisUsageEntity>,
  ) {}

  async findByUserId(userId: string): Promise<AccountAnalysisUsage | null> {
    const record = await this.usage.findOne({ where: { userId } });

    return record
      ? {
          userId: record.userId,
          analysisId: record.analysisId,
          // The API has always exposed this as an ISO string.
          redeemedAt: record.redeemedAt.toISOString(),
        }
      : null;
  }

  async recordUsage(userId: string, analysisId: string): Promise<AccountAnalysisUsage> {
    // user_id is the primary key, so a second redemption would collide.
    // Ignoring the conflict keeps the first redemption, matching the
    // onConflictDoNothing the Drizzle repository used.
    await this.usage
      .createQueryBuilder()
      .insert()
      .into(AccountAnalysisUsageEntity)
      .values({ userId, analysisId, redeemedAt: new Date() })
      .orIgnore()
      .execute();

    const stored = await this.findByUserId(userId);

    if (!stored) {
      throw new Error("Account usage was not stored.");
    }

    return stored;
  }
}
