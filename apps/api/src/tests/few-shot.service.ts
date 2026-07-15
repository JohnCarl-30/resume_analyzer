import assert from "node:assert/strict";

import { fewShotService } from "../services/few-shot.service.js";
import type { ExtractedResumeProfile } from "../types/resume-extraction.js";

const baseProfile: ExtractedResumeProfile = {
  fullName: "Alex Lee",
  email: "alex@example.com",
  phone: "",
  summary: "Backend engineer",
  skills: ["Go", "PostgreSQL"],
  education: [],
  experience: [],
  leadership: [],
  projects: [],
  awards: [],
};

async function run() {
  console.log("Running few-shot service checks...");

  await fewShotService.storeExample({
    resumeText: "Senior Full Stack Engineer with React, Node.js, and PostgreSQL experience.",
    targetRole: "Senior Full Stack Engineer",
    extractedProfile: baseProfile,
    quality: 95,
  });

  await fewShotService.storeExample({
    resumeText: "Data Scientist specializing in Python, pandas, and machine learning pipelines.",
    targetRole: "Data Scientist",
    extractedProfile: baseProfile,
    quality: 90,
  });

  const matches = await fewShotService.findRelevantExamples(
    "Experienced with React and Node.js building APIs with PostgreSQL.",
    "Senior Full Stack Engineer",
    1,
  );

  assert.equal(matches.length, 1, "findRelevantExamples should return the requested count");
  assert.equal(
    matches[0]?.targetRole,
    "Senior Full Stack Engineer",
    "Role and keyword overlap should prefer the full-stack example",
  );

  const formatted = fewShotService.formatExamplesForPrompt(matches);
  assert.ok(formatted.includes("Example 1:"), "Prompt formatter should include example headings");
  assert.ok(formatted.includes("Senior Full Stack Engineer"), "Prompt formatter should include target role");

  const allExamples = fewShotService.getAllExamples();
  assert.ok(allExamples.length >= 2, "Stored examples should be retrievable");

  console.log("Few-shot service checks passed.");
}

void run().then(undefined, (error) => {
  console.error("Few-shot service checks failed.", error);
  process.exitCode = 1;
});
