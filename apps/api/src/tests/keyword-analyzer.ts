import assert from "node:assert/strict";

import { analyzeKeywords, extractJdKeywords } from "../analyzers/keyword.analyzer.js";

const resumeText = `
Frontend Engineer with React and TypeScript experience.
Built scalable web applications and REST APIs.
Improved performance by 25%.
`;

const jobDescription = `
We need a Frontend Engineer with React, TypeScript, and Node.js experience.
Strong understanding of REST APIs, accessibility, and performance optimization.
`;

function run() {
  console.log("Running keyword analyzer checks...");

  const extracted = extractJdKeywords(jobDescription);

  assert.ok(extracted.includes("react"), "JD keyword extraction should include React");
  assert.ok(extracted.includes("typescript"), "JD keyword extraction should include TypeScript");
  assert.ok(
    extracted.some((keyword) => keyword.includes("rest")),
    "JD keyword extraction should include REST API terms",
  );
  assert.ok(
    !extracted.includes("the"),
    "JD keyword extraction should filter stop words",
  );

  const withProvidedKeywords = analyzeKeywords(resumeText, jobDescription, {
    jdKeywords: ["React", "TypeScript", "Docker"],
  });

  assert.deepEqual(
    withProvidedKeywords.matchedKeywords.sort(),
    ["React", "TypeScript"],
    "Provided JD keywords should drive matching",
  );
  assert.deepEqual(
    withProvidedKeywords.missingKeywords,
    ["Docker"],
    "Missing provided keywords should be reported",
  );
  assert.ok(withProvidedKeywords.keywordScore > 0, "Matched keywords should produce a positive score");

  const fallbackKeywords = analyzeKeywords(resumeText, jobDescription);
  assert.ok(fallbackKeywords.matchedKeywords.length > 0, "Analyzer should fall back to extracted JD keywords");
  assert.ok(fallbackKeywords.keywordScore >= 0 && fallbackKeywords.keywordScore <= 100);

  console.log("Keyword analyzer checks passed.");
}

try {
  run();
} catch (error) {
  console.error("Keyword analyzer checks failed.", error);
  process.exitCode = 1;
}
