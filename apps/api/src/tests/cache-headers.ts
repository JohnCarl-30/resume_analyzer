import assert from "node:assert/strict";

import { app } from "../app.js";

interface ApiHeaderCase {
  name: string;
  path: string;
  init?: RequestInit;
}

const PRIVATE_API_CASES: ApiHeaderCase[] = [
  {
    name: "analysis list",
    path: "/api/analysis",
  },
  {
    name: "analysis detail",
    path: "/api/analysis/missing-analysis-id",
  },
  {
    name: "analysis source file",
    path: "/api/analysis/missing-analysis-id/source",
  },
  {
    name: "resume list",
    path: "/api/resumes",
  },
  {
    name: "bullet enhancement",
    path: "/api/enhance/bullets",
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    },
  },
  {
    name: "upload target",
    path: "/api/uploads/sign",
    init: {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: "resume.pdf",
        contentType: "application/pdf",
      }),
    },
  },
];

async function run() {
    await Promise.all(
      PRIVATE_API_CASES.map(async (testCase) => {
        const response = await app.request(testCase.path, testCase.init);

        assert.equal(
          response.headers.get("cache-control"),
          "private, no-store, max-age=0, must-revalidate",
          `${testCase.name} should opt out of shared and browser caches`,
        );
        assert.equal(
          response.headers.get("vercel-cdn-cache-control"),
          "no-store",
          `${testCase.name} should opt out of Vercel CDN caching`,
        );
        assert.equal(
          response.headers.get("pragma"),
          "no-cache",
          `${testCase.name} should include legacy no-cache header`,
        );
        assert.equal(
          response.headers.get("expires"),
          "0",
          `${testCase.name} should include an expired timestamp header`,
        );
      }),
    );

  console.log("Private API cache header checks passed.");
}

void run().catch((error) => {
  console.error("Private API cache header checks failed.", error);
  process.exitCode = 1;
});
