import type { ResumeAnalysis, AnalysisSuggestion } from "../types/analysis.js";
import { createAnalysisSchema } from "../schemas/analysis.schema.js";

const trackedKeywords = [
  "typescript",
  "javascript",
  "react",
  "next.js",
  "node.js",
  "express",
  "postgresql",
  "sql",
  "aws",
  "docker",
  "kubernetes",
  "git",
  "api",
  "testing",
  "ci/cd",
  "microservices",
  "leadership",
  "communication",
  "analytics",
  "python",
] as const;

const weakActionPhrases = [
  "worked on",
  "helped with",
  "responsible for",
  "tasked with",
] as const;

function normalizeText(value: string) {
  return value.toLowerCase();
}

function uniqueSorted(values: Iterable<string>) {
  return Array.from(new Set(values)).sort((left, right) => left.localeCompare(right));
}

export const analysisService = {
  async createAnalysis(input: unknown): Promise<ResumeAnalysis> {
    const payload = createAnalysisSchema.parse(input);

    const normalizedJobDescription = normalizeText(payload.jobDescription);
    const normalizedResumeText = normalizeText(payload.resumeText);

    const matchedKeywords = trackedKeywords.filter(
      (keyword) =>
        normalizedJobDescription.includes(keyword) && normalizedResumeText.includes(keyword),
    );
    const missingKeywords = trackedKeywords.filter(
      (keyword) =>
        normalizedJobDescription.includes(keyword) && !normalizedResumeText.includes(keyword),
    );

    const suggestions: AnalysisSuggestion[] = [];

    if (missingKeywords.length > 0) {
      suggestions.push({
        id: "missing-keywords",
        title: "Add missing job keywords",
        detail: `Consider adding evidence for ${missingKeywords
          .slice(0, 3)
          .join(", ")} to better align the resume with the target role.`,
        severity: "high",
        category: "keywords",
      });
    }

    const foundWeakPhrase = weakActionPhrases.find((phrase) =>
      normalizedResumeText.includes(phrase),
    );

    if (foundWeakPhrase) {
      suggestions.push({
        id: "stronger-verbs",
        title: "Use stronger action verbs",
        detail: `Replace phrases like "${foundWeakPhrase}" with clearer ownership verbs such as "built", "led", or "improved".`,
        severity: "medium",
        category: "writing",
      });
    }

    const containsImpactMetric = /\b\d+%|\b\d+\s?(users|clients|requests|projects|hours|days)\b/i.test(
      payload.resumeText,
    );

    if (!containsImpactMetric) {
      suggestions.push({
        id: "add-metrics",
        title: "Add measurable impact",
        detail: "Include metrics like percentages, throughput, or team size so accomplishments are easier to trust and compare.",
        severity: "medium",
        category: "impact",
      });
    }

    const scoreBase = 45;
    const keywordScore = matchedKeywords.length * 8;
    const penalty = missingKeywords.length * 5 + suggestions.filter((item) => item.severity === "high").length * 4;
    const score = Math.max(32, Math.min(98, scoreBase + keywordScore - penalty));

    return {
      targetRole: payload.targetRole,
      score,
      matchedKeywords: uniqueSorted(matchedKeywords),
      missingKeywords: uniqueSorted(missingKeywords),
      suggestions,
      generatedAt: new Date().toISOString(),
    };
  },
};
