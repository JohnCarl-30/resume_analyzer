import { ForbiddenException } from "@nestjs/common";
import { Test } from "@nestjs/testing";

import { AccountService, ANALYSIS_QUOTA_LIMIT } from "./account.service.js";
import { ACCOUNT_USAGE_REPOSITORY } from "./repositories/account-usage.repository.js";
import { InMemoryAccountUsageRepository } from "./repositories/in-memory-account-usage.repository.js";

describe("AccountService", () => {
  let service: AccountService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: ACCOUNT_USAGE_REPOSITORY, useClass: InMemoryAccountUsageRepository },
      ],
    }).compile();

    service = moduleRef.get(AccountService);
  });

  it("reports an unused quota for a new account", async () => {
    expect(await service.getAnalysisQuota("user-1")).toEqual({
      limit: ANALYSIS_QUOTA_LIMIT,
      used: 0,
      canAnalyze: true,
      analysisId: null,
      redeemedAt: null,
    });
  });

  it("reports the quota as spent once an analysis is redeemed", async () => {
    await service.recordAnalysisRedemption("user-1", "analysis-1");

    const quota = await service.getAnalysisQuota("user-1");
    expect(quota).toMatchObject({ used: 1, canAnalyze: false, analysisId: "analysis-1" });
    expect(quota.redeemedAt).toEqual(expect.any(String));
  });

  it("keeps one account's usage away from another's", async () => {
    await service.recordAnalysisRedemption("user-1", "analysis-1");

    expect(await service.getAnalysisQuota("user-2")).toMatchObject({
      used: 0,
      canAnalyze: true,
    });
  });

  describe("assertCanCreateAnalysis", () => {
    it("allows an account that has not analysed yet", async () => {
      await expect(service.assertCanCreateAnalysis("user-1")).resolves.toBeUndefined();
    });

    it("refuses an account that has", async () => {
      await service.recordAnalysisRedemption("user-1", "analysis-1");

      await expect(service.assertCanCreateAnalysis("user-1")).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  // The check is once per account, so a repeat redemption must not overwrite
  // which analysis was the one that spent it.
  it("keeps the first redemption when one is recorded twice", async () => {
    await service.recordAnalysisRedemption("user-1", "analysis-1");
    await service.recordAnalysisRedemption("user-1", "analysis-2");

    expect(await service.getAnalysisQuota("user-1")).toMatchObject({
      analysisId: "analysis-1",
    });
  });
});
