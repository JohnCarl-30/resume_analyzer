import type { ResumeAnalysis, AnalysisSuggestion } from "../types/analysis.js";
import {
  createAnalysisSchema,
  createUploadedAnalysisSchema,
} from "../schemas/analysis.schema.js";
import { HttpError } from "../utils/http-error.js";
import { openAiResumeExtractionService } from "./openai-resume-extraction.service.js";
import { resumeParserService } from "./resume-parser.service.js";
import type { PersistedResumeAnalysis } from "../repositories/analysis.repository.js";
import { db } from "../db/client.js";
import { inMemoryAnalysisRepository } from "../repositories/in-memory-analysis.repository.js";
import { postgresAnalysisRepository } from "../repositories/postgres-analysis.repository.js";

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

const analysisRepository = db.isConfigured
  ? postgresAnalysisRepository
  : inMemoryAnalysisRepository;

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

  async createAnalysisFromUpload(input: {
    targetRole: unknown;
    jobDescription: unknown;
    selectedTemplateId: unknown;
    resumeFile?: Express.Multer.File;
  }): Promise<PersistedResumeAnalysis> {
    const payload = createUploadedAnalysisSchema.parse({
      targetRole: input.targetRole,
      jobDescription: input.jobDescription,
      selectedTemplateId: input.selectedTemplateId,
    });

    if (!input.resumeFile) {
      throw new HttpError(400, "Please upload a PDF or DOCX resume.");
    }

    const extracted = await resumeParserService.extractText(input.resumeFile);

    if (extracted.text.length < 30) {
      throw new HttpError(
        400,
        "We could not extract enough text from this file. Try a clearer PDF or DOCX resume.",
      );
    }

    const analysis = await this.createAnalysis({
      ...payload,
      resumeText: extracted.text,
    });

    const extractedProfile = await openAiResumeExtractionService.extractProfile({
      resumeText: extracted.text,
      targetRole: payload.targetRole,
    });

    return analysisRepository.create({
      ...analysis,
      jobDescription: payload.jobDescription,
      selectedTemplateId: payload.selectedTemplateId,
      parsedResumeText: extracted.text,
      sourceFileName: input.resumeFile.originalname,
      extractedCharacterCount: extracted.text.length,
      extractedProfile,
      extractionProvider: extractedProfile ? "openai" : "parser",
    });
  },

  async getAnalysisById(analysisId: string): Promise<PersistedResumeAnalysis> {
    const analysis = await analysisRepository.findById(analysisId);

    if (!analysis) {
      throw new HttpError(404, "Saved analysis not found.");
    }

    return analysis;
  },

  async updateAnalysis(
    analysisId: string,
    input: { jobDescription: string; targetRole?: string },
  ): Promise<PersistedResumeAnalysis> {
    const existing = await this.getAnalysisById(analysisId);

    const updatedAnalysis = await this.createAnalysis({
      targetRole: input.targetRole ?? existing.targetRole,
      jobDescription: input.jobDescription,
      resumeText: existing.parsedResumeText,
    });

    const persisted: PersistedResumeAnalysis = {
      ...existing,
      ...updatedAnalysis,
      id: analysisId,
      jobDescription: input.jobDescription,
      targetRole: input.targetRole ?? existing.targetRole,
    };

    return analysisRepository.update(analysisId, persisted);
  },
};
