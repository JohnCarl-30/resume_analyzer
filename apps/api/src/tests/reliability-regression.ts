import assert from "node:assert/strict";

import { inMemoryAnalysisRepository } from "../repositories/in-memory-analysis.repository.js";
import { jdExtractionService } from "../services/jd-extraction.service.js";
import { resumeExtractionService } from "../services/resume-extraction.service.js";
import { aiProvider } from "../lib/ai-provider.js";

async function run() {
  const originalEnabled = aiProvider.isEnabled;

  // Force enable for testing
  Object.defineProperty(aiProvider, "isEnabled", {
    value: () => true,
    writable: true,
    configurable: true,
  });

  try {
    // Test 1: JD extraction fallback when AI throws
    const fallbackJd = await jdExtractionService.extractKeywordsFromJd(
      "Need TypeScript and React",
      "Frontend Engineer",
    );

    // When generateObject throws (no project configured), service falls back
    assert.deepEqual(fallbackJd, {
      keywords: [],
      requiredSkills: [],
      targetRoleTitle: "Frontend Engineer",
    });

    // Test 2: Resume extraction fallback when AI throws
    const fallbackProfile = await resumeExtractionService.extractProfile({
      resumeText: "Sample resume text",
      targetRole: "Frontend Engineer",
    });

    assert.equal(fallbackProfile, null);

    // Test 3: In-memory repository persistence
    const created = await inMemoryAnalysisRepository.create({
      targetRole: "Frontend Engineer",
      selectedTemplateId: "minimalist-grid",
      jobDescription: "Need TypeScript and React experience in production systems.",
      parsedResumeText: "Built a dashboard that increased conversions by 15%.",
      score: 88,
      metricsFound: 3,
      matchedKeywords: ["TypeScript"],
      missingKeywords: ["React"],
      suggestions: [],
      generatedAt: new Date().toISOString(),
    });

    assert.equal(created.metricsFound, 3);

    const saved = await inMemoryAnalysisRepository.findById(created.id);
    assert.equal(saved?.metricsFound, 3);

    console.log("Reliability regression checks passed.");
  } finally {
    Object.defineProperty(aiProvider, "isEnabled", {
      value: originalEnabled,
      writable: true,
      configurable: true,
    });
  }
}

void run().catch((error) => {
  console.error("Reliability regression checks failed.", error);
  process.exitCode = 1;
});
