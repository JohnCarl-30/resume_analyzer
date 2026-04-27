import assert from "node:assert/strict";

import { inMemoryAnalysisRepository } from "../repositories/in-memory-analysis.repository.js";
import { openAiClient } from "../lib/openai-client.js";
import { openAiJdExtractionService } from "../services/openai-jd-extraction.service.js";
import { openAiResumeExtractionService } from "../services/openai-resume-extraction.service.js";

async function run() {
  const originalCreateCompletion = openAiClient.createStructuredChatCompletion;
  const originalJdEnabled = openAiJdExtractionService.isEnabled;
  const originalResumeEnabled = openAiResumeExtractionService.isEnabled;

  openAiJdExtractionService.isEnabled = () => true;
  openAiResumeExtractionService.isEnabled = () => true;

  try {
    openAiClient.createStructuredChatCompletion = async () => "{not-json";

    const fallbackJd = await openAiJdExtractionService.extractKeywordsFromJd(
      "Need TypeScript and React",
      "Frontend Engineer",
    );

    assert.deepEqual(fallbackJd, {
      keywords: [],
      requiredSkills: [],
      targetRoleTitle: "Frontend Engineer",
    });

    openAiClient.createStructuredChatCompletion = async () =>
      JSON.stringify({
        keywords: ["TypeScript", "React"],
        requiredSkills: ["React"],
        targetRoleTitle: "Senior Frontend Engineer",
      });

    const extractedJd = await openAiJdExtractionService.extractKeywordsFromJd(
      "Need TypeScript and React",
      "Frontend Engineer",
    );

    assert.deepEqual(extractedJd, {
      keywords: ["TypeScript", "React"],
      requiredSkills: ["React"],
      targetRoleTitle: "Senior Frontend Engineer",
    });

    openAiClient.createStructuredChatCompletion = async () => "{not-json";

    const fallbackProfile = await openAiResumeExtractionService.extractProfile({
      resumeText: "Sample resume text",
      targetRole: "Frontend Engineer",
    });

    assert.equal(fallbackProfile, null);

    openAiClient.createStructuredChatCompletion = async () =>
      JSON.stringify({
        fullName: " Alex Doe ",
        email: "alex@example.com",
        phone: "123",
        summary: "Builder",
        skills: [" TypeScript "],
        education: [],
        experience: [],
        leadership: [],
        projects: [],
        awards: [],
      });

    const extractedProfile = await openAiResumeExtractionService.extractProfile({
      resumeText: "Sample resume text",
      targetRole: "Frontend Engineer",
    });

    assert.equal(extractedProfile?.fullName, "Alex Doe");
    assert.deepEqual(extractedProfile?.skills, ["TypeScript"]);

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
    openAiClient.createStructuredChatCompletion = originalCreateCompletion;
    openAiJdExtractionService.isEnabled = originalJdEnabled;
    openAiResumeExtractionService.isEnabled = originalResumeEnabled;
  }
}

void run().catch((error) => {
  console.error("Reliability regression checks failed.", error);
  process.exitCode = 1;
});
