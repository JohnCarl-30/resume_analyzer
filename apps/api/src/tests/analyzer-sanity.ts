import { analyzeKeywords } from "../analyzers/keyword.analyzer.js";
import { analyzeWritingQuality } from "../analyzers/writing.analyzer.js";
import { analyzeImpactMetrics } from "../analyzers/impact.analyzer.js";
import { computeScore } from "../scoring/score.js";

const mockResumeText = `
Experienced Software Engineer with a passion for building scalable web applications.
Managed a team of 5 developers.
Developed a new feature that increased user engagement by 20%.
Proficient in React, Node.js, and TypeScript.
Helped build a new API.
`;

const mockJdKeywords = ["React", "Node.js", "TypeScript", "Scalable", "Frontend"];
const mockRequiredSkills = ["React", "Node.js", "Docker", "Kubernetes"];

async function runSanityCheck() {
  console.log("Running Analyzer Sanity Checks...");

  // 1. Keyword Analyzer
  const keywordResult = analyzeKeywords(mockResumeText, "", { jdKeywords: mockJdKeywords });
  console.log("Keyword Result:", keywordResult);

  // 2. Writing Analyzer
  const writingResult = analyzeWritingQuality(mockResumeText);
  console.log("Writing Result:", writingResult);

  // 3. Impact Analyzer
  const impactResult = analyzeImpactMetrics(mockResumeText);
  console.log("Impact Result:", impactResult);

  // 4. Score Computation
  const scoring = computeScore({
    keywordScore: keywordResult.keywordScore,
    requiredSkillsMatched: 3, // Mocked for test
    requiredSkillsTotal: 4,
    writingPenalty: writingResult.penalty,
    impactPenalty: impactResult.penalty,
    highSeverityCount: 0
  });
  console.log("Final Score:", scoring);
}

runSanityCheck().catch(console.error);
