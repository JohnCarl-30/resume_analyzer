import assert from "node:assert/strict";

import { evaluationService } from "../services/evaluation.service.js";
import type { ExtractedResumeProfile } from "../types/resume-extraction.js";

const groundTruthProfile: ExtractedResumeProfile = {
  fullName: "Jane Smith",
  email: "jane@example.com",
  phone: "",
  summary: "Full-stack engineer",
  skills: ["React", "Node.js", "PostgreSQL"],
  education: [{ institution: "MIT", degree: "B.S. CS", location: "MA", dateRange: "2018-2022" }],
  experience: [{ role: "Software Engineer", location: "NYC", dateRange: "2022-Present", bullets: [] }],
  leadership: [],
  projects: [{ name: "Analytics Dashboard", technologies: "React", link: "", startDate: "2023", endDate: "2024", bullets: [] }],
  awards: ["Dean's List"],
};

const predictedProfile: ExtractedResumeProfile = {
  ...groundTruthProfile,
  skills: ["React", "TypeScript"],
  experience: [{ role: "Frontend Engineer", location: "NYC", dateRange: "2022-Present", bullets: [] }],
  awards: [],
};

function run() {
  console.log("Running evaluation service checks...");

  const keywordMetrics = evaluationService.evaluateKeywords(
    ["React", "Node.js", "Docker"],
    ["React", "GraphQL"],
    ["Node.js", "Docker"],
  );

  assert.equal(keywordMetrics.truePositives, 1, "React should count as a true positive");
  assert.equal(keywordMetrics.falsePositives, 1, "GraphQL should count as a false positive");
  assert.equal(keywordMetrics.falseNegatives, 2, "Node.js and Docker should count as false negatives");
  assert.equal(keywordMetrics.precision, 50, "Precision should be 50%");
  assert.equal(keywordMetrics.recall, 33, "Recall should round to 33%");
  assert.equal(keywordMetrics.f1Score, 40, "F1 score should round to 40%");

  const extractionMetrics = evaluationService.evaluateExtraction(groundTruthProfile, predictedProfile);

  assert.ok(extractionMetrics.precision >= 0 && extractionMetrics.precision <= 100);
  assert.ok(extractionMetrics.recall >= 0 && extractionMetrics.recall <= 100);
  assert.ok(extractionMetrics.f1Score >= 0 && extractionMetrics.f1Score <= 100);
  assert.ok(extractionMetrics.fieldAccuracy.skills < 100, "Partial skill overlap should reduce skill recall");

  const fullEvaluation = evaluationService.runEvaluation({
    groundTruthExtraction: groundTruthProfile,
    predictedExtraction: predictedProfile,
    groundTruthKeywords: ["React", "Node.js"],
    matchedKeywords: ["React"],
    missingKeywords: ["Node.js"],
  });

  assert.ok(fullEvaluation.extraction, "Full evaluation should include extraction metrics");
  assert.ok(fullEvaluation.keywords, "Full evaluation should include keyword metrics");
  assert.ok(fullEvaluation.overallScore > 0, "Overall score should average component F1 scores");

  console.log("Evaluation service checks passed.");
}

try {
  run();
} catch (error) {
  console.error("Evaluation service checks failed.", error);
  process.exitCode = 1;
}
