import { generateObject } from "ai";
import { z } from "zod";

import { analyzeAtsAlignment } from "../analyzers/ats.analyzer.js";
import { analyzeImpactMetrics } from "../analyzers/impact.analyzer.js";
import { analyzeKeywords } from "../analyzers/keyword.analyzer.js";
import { analyzeWritingQuality } from "../analyzers/writing.analyzer.js";
import { env } from "../config/env.js";
import { aiProvider } from "../lib/ai-provider.js";
import { computeScore } from "../scoring/score.js";
import type { AnalysisSuggestion } from "../types/analysis.js";

const suggestionSchema = z.object({
  id: z.string(),
  title: z.string(),
  detail: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  category: z.enum(["keywords", "writing", "impact"]),
});

const aiResumeAnalysisSchema = z.object({
  matchedKeywords: z
    .array(z.string())
    .describe("Job-relevant keywords and skills clearly evidenced in the resume, including reasonable synonyms."),
  missingKeywords: z
    .array(z.string())
    .describe("Important job keywords or required skills not evidenced in the resume."),
  metricsFound: z
    .number()
    .int()
    .min(0)
    .describe("Count of distinct quantified outcomes in the resume (percentages, counts, scale, time saved, etc.)."),
  score: z
    .number()
    .min(20)
    .max(98)
    .describe(
      "Overall fit score from 20-98. Weight keyword alignment ~45%, required skills ~35%, writing/structure ~10%, measurable impact ~10%. Never use 0 or 100.",
    ),
  suggestions: z
    .array(suggestionSchema)
    .describe(
      "Actionable suggestions covering ATS alignment, missing keywords, writing quality, and measurable impact. Include at least one ATS-oriented suggestion when relevant.",
    ),
});

export interface ResumeAnalysisInput {
  resumeText: string;
  jobDescription: string;
  targetRole: string;
  jdKeywords: string[];
  requiredSkills: string[];
}

export interface ResumeAnalysisOutput {
  matchedKeywords: string[];
  missingKeywords: string[];
  metricsFound: number;
  suggestions: AnalysisSuggestion[];
  score: number;
}

function clampScore(score: number): number {
  return Math.round(Math.max(20, Math.min(98, score)));
}

function dedupeStrings(values: string[]): string[] {
  const seen = new Set<string>();
  return values
    .map((value) => value.trim())
    .filter((value) => {
      const key = value.toLowerCase();
      if (!key || seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
}

function sanitizeSuggestions(suggestions: AnalysisSuggestion[]): AnalysisSuggestion[] {
  return suggestions.map((suggestion, index) => ({
    id: suggestion.id.trim() || `suggestion-${index + 1}`,
    title: suggestion.title.trim(),
    detail: suggestion.detail.trim(),
    severity: suggestion.severity,
    category: suggestion.category,
  }));
}

function buildKeywordSuggestions(
  missingKeywords: string[],
  requiredSkills: string[],
): AnalysisSuggestion[] {
  if (missingKeywords.length === 0) {
    return [];
  }

  const suggestions: AnalysisSuggestion[] = [];
  const normalizedRequired = requiredSkills.map((skill) => skill.toLowerCase());

  const missingRequired = missingKeywords.filter((keyword) =>
    normalizedRequired.includes(keyword.toLowerCase()),
  );

  const missingOptional = missingKeywords.filter(
    (keyword) => !normalizedRequired.includes(keyword.toLowerCase()),
  );

  if (missingRequired.length > 0) {
    suggestions.push({
      id: "missing-required-skills",
      title: "Missing required skills",
      detail: `These skills are listed as required in the job post but are missing from your resume: ${missingRequired.slice(0, 5).join(", ")}${missingRequired.length > 5 ? ` (+${missingRequired.length - 5} more)` : ""}.`,
      severity: "high",
      category: "keywords",
    });
  }

  if (missingOptional.length > 0) {
    suggestions.push({
      id: "missing-keywords",
      title: "Add relevant job post words",
      detail: `Consider naturally incorporating: ${missingOptional.slice(0, 4).join(", ")} to improve alignment with the role.`,
      severity: "medium",
      category: "keywords",
    });
  }

  return suggestions;
}

function analyzeWithRules(input: ResumeAnalysisInput): ResumeAnalysisOutput {
  const keywordResult = analyzeKeywords(input.resumeText, input.jobDescription, {
    jdKeywords: input.jdKeywords.length > 0 ? input.jdKeywords : undefined,
  });
  const writingResult = analyzeWritingQuality(input.resumeText);
  const impactResult = analyzeImpactMetrics(input.resumeText);

  const normalizedResume = input.resumeText.toLowerCase();
  const requiredSkillsMatched = input.requiredSkills.filter((skill) =>
    normalizedResume.includes(skill.toLowerCase()),
  ).length;

  const atsSuggestions = analyzeAtsAlignment({
    resumeText: input.resumeText,
    targetRole: input.targetRole,
    jdKeywords:
      input.jdKeywords.length > 0
        ? input.jdKeywords
        : [...keywordResult.matchedKeywords, ...keywordResult.missingKeywords],
    matchedKeywords: keywordResult.matchedKeywords,
    missingKeywords: keywordResult.missingKeywords,
    requiredSkills: input.requiredSkills,
  });

  const suggestions: AnalysisSuggestion[] = [
    ...atsSuggestions,
    ...buildKeywordSuggestions(keywordResult.missingKeywords, input.requiredSkills),
    ...writingResult.suggestions,
    ...impactResult.suggestions,
  ];

  const highSeverityCount = suggestions.filter((suggestion) => suggestion.severity === "high").length;

  const { score } = computeScore({
    keywordScore: keywordResult.keywordScore,
    requiredSkillsMatched,
    requiredSkillsTotal: input.requiredSkills.length,
    writingPenalty: writingResult.penalty,
    impactPenalty: impactResult.penalty,
    highSeverityCount,
  });

  return {
    matchedKeywords: keywordResult.matchedKeywords,
    missingKeywords: keywordResult.missingKeywords,
    metricsFound: impactResult.metricsFound,
    suggestions,
    score,
  };
}

async function analyzeWithAi(input: ResumeAnalysisInput): Promise<ResumeAnalysisOutput> {
  const keywordHint =
    input.jdKeywords.length > 0
      ? `Extracted JD keywords: ${input.jdKeywords.join(", ")}`
      : "No pre-extracted JD keywords — derive important terms from the job description.";

  const requiredSkillsHint =
    input.requiredSkills.length > 0
      ? `Required skills from JD: ${input.requiredSkills.join(", ")}`
      : "No explicit required skills were extracted — infer must-haves from the job description.";

  const { object } = await generateObject({
    model: aiProvider.getModel(),
    schema: aiResumeAnalysisSchema,
    temperature: 0.2,
    system: [
      "You are an expert resume coach and ATS-aware recruiter.",
      "Analyze how well the resume matches the job using semantic understanding, not literal substring matching only.",
      "Count a keyword as matched when the resume clearly demonstrates that skill or equivalent experience (reasonable synonyms and phrasing count).",
      "Generate specific, truthful suggestions. Do not invent resume facts.",
      "Include ATS-oriented suggestions (target role placement, standard headings, keyword placement in bullets) when applicable.",
      "Include writing suggestions (weak verbs, passive voice, clarity) and impact suggestions (missing metrics) when applicable.",
      "Use stable snake-case ids for suggestions (e.g. ats-target-role-alignment, missing-required-skills, stronger-verbs, add-metrics).",
      "Return 3-8 high-quality suggestions, prioritizing the most important gaps.",
    ].join(" "),
    prompt: [
      `Target role: ${input.targetRole}`,
      keywordHint,
      requiredSkillsHint,
      "",
      "Job description:",
      input.jobDescription,
      "",
      "Resume text:",
      input.resumeText,
    ].join("\n"),
  });

  return {
    matchedKeywords: dedupeStrings(object.matchedKeywords),
    missingKeywords: dedupeStrings(object.missingKeywords),
    metricsFound: object.metricsFound,
    suggestions: sanitizeSuggestions(object.suggestions),
    score: clampScore(object.score),
  };
}

export const resumeAnalysisService = {
  isEnabled() {
    return aiProvider.isEnabled();
  },

  async analyze(input: ResumeAnalysisInput): Promise<ResumeAnalysisOutput> {
    if (!this.isEnabled()) {
      return analyzeWithRules(input);
    }

    try {
      return await analyzeWithAi(input);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      console.warn(
        `[resume-analysis] AI analysis failed for model "${env.AI_EXTRACTION_MODEL}". Falling back to rule-based analyzers. Reason: ${reason}`,
      );
      return analyzeWithRules(input);
    }
  },
};
