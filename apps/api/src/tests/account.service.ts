import assert from "node:assert/strict";

import { accountService } from "../services/account.service.js";

async function run() {
  console.log("Running account service checks...");

  const userId = `user_${Date.now()}`;

  const initialQuota = await accountService.getAnalysisQuota(userId);
  assert.equal(initialQuota.limit, 1);
  assert.equal(initialQuota.used, 0);
  assert.equal(initialQuota.canAnalyze, true);

  await accountService.recordAnalysisRedemption(userId, "analysis_test_1");

  const usedQuota = await accountService.getAnalysisQuota(userId);
  assert.equal(usedQuota.used, 1);
  assert.equal(usedQuota.canAnalyze, false);
  assert.equal(usedQuota.analysisId, "analysis_test_1");

  await assert.rejects(
    () => accountService.assertCanCreateAnalysis(userId),
    /already used its one resume analysis/,
  );

  console.log("Account service checks passed.");
}

try {
  await run();
} catch (error) {
  console.error("Account service checks failed.", error);
  process.exitCode = 1;
}
