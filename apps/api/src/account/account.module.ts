import { type DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DatabaseModule } from "../database/database.module.js";
import { AccountAnalysisUsageEntity } from "../database/entities/account-analysis-usage.entity.js";
import { AccountController } from "./account.controller.js";
import { AccountService } from "./account.service.js";
import { ACCOUNT_USAGE_REPOSITORY } from "./repositories/account-usage.repository.js";
import { InMemoryAccountUsageRepository } from "./repositories/in-memory-account-usage.repository.js";
import { TypeOrmAccountUsageRepository } from "./repositories/typeorm-account-usage.repository.js";

/**
 * AccountService is exported, not just routed: the analysis flow depends on it
 * to check and spend the quota, and will inject it once that module is ported.
 */
@Module({})
export class AccountModule {
  static register(): DynamicModule {
    const usePostgres = DatabaseModule.isConfigured;

    return {
      // Global so the analysis module can inject AccountService without
      // re-registering the module -- a second registration would carry its own
      // in-memory usage store, and the quota spent through one would be
      // invisible to the other.
      global: true,
      module: AccountModule,
      imports: usePostgres
        ? [TypeOrmModule.forFeature([AccountAnalysisUsageEntity])]
        : [],
      controllers: [AccountController],
      providers: [
        AccountService,
        {
          provide: ACCOUNT_USAGE_REPOSITORY,
          useClass: usePostgres
            ? TypeOrmAccountUsageRepository
            : InMemoryAccountUsageRepository,
        },
      ],
      exports: [AccountService],
    };
  }
}
