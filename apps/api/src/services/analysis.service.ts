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

// Composable analyzers
import { analyzeKeywords } from "../analyzers/keyword.analyzer.js";
import { analyzeWritingQuality } from "../analyzers/writing.analyzer.js";
import { analyzeImpactMetrics } from "../analyzers/impact.analyzer.js";

// OpenAI-powered JD extraction
import { openAiJdExtractionService } from "./openai-jd-extraction.service.js";

// Scoring
import { computeScore } from "../scoring/score.js";

const analysisRepository = db.isConfigured
  ? postgresAnalysisRepository
  : inMemoryAnalysisRepository;

export const analysisService = {
  async createAnalysis(input: unknown): Promise<ResumeAnalysis> {
    const payload = createAnalysisSchema.parse(input);

    // Step 1: Extract structured keywords from JD via OpenAI (if enabled)
    const jdExtraction = await openAiJdExtractionService.extractKeywordsFromJd(
      payload.jobDescription,
      payload.targetRole,
    );

    // Step 2: Run composable analyzers in parallel
    const [keywordResult, writingResult, impactResult] = await Promise.all([
      Promise.resolve(
        analyzeKeywords(payload.resumeText, payload.jobDescription, {
          jdKeywords: jdExtraction.keywords.length > 0 ? jdExtraction.keywords : undefined,
        }),
      ),
      Promise.resolve(analyzeWritingQuality(payload.resumeText)),
      Promise.resolve(analyzeImpactMetrics(payload.resumeText)),
    ]);

    // Step 3: Count required skill matches
    const normalizedResume = payload.resumeText.toLowerCase();
    const requiredSkillsMatched = jdExtraction.requiredSkills.filter((skill) =>
      normalizedResume.includes(skill.toLowerCase()),
    ).length;

    // Step 4: Collect all suggestions
    const allSuggestions: AnalysisSuggestion[] = [
      ...buildKeywordSuggestions(keywordResult.missingKeywords, jdExtraction.requiredSkills),
      ...writingResult.suggestions,
      ...impactResult.suggestions,
    ];

    const highSeverityCount = allSuggestions.filter((s) => s.severity === "high").length;

    // Step 5: Compute weighted score
    const { score } = computeScore({
      keywordScore: keywordResult.keywordScore,
      requiredSkillsMatched,
      requiredSkillsTotal: jdExtraction.requiredSkills.length,
      writingPenalty: writingResult.penalty,
      impactPenalty: impactResult.penalty,
      highSeverityCount,
    });

    return {
      targetRole: jdExtraction.targetRoleTitle || payload.targetRole,
      score,
      metricsFound: impactResult.metricsFound,
      matchedKeywords: keywordResult.matchedKeywords,
      missingKeywords: keywordResult.missingKeywords,
      suggestions: allSuggestions,
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
      targetRole: analysis.targetRole,
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

/**
 * Builds keyword suggestions, distinguishing between missing required skills
 * (high severity) and missing general JD keywords (medium severity).
 */
function buildKeywordSuggestions(
  missingKeywords: string[],
  requiredSkills: string[],
): AnalysisSuggestion[] {
  if (missingKeywords.length === 0) return [];

  const suggestions: AnalysisSuggestion[] = [];

  const missingRequired = missingKeywords.filter((kw) =>
    requiredSkills.map((s) => s.toLowerCase()).includes(kw.toLowerCase()),
  );

  const missingOptional = missingKeywords.filter(
    (kw) => !requiredSkills.map((s) => s.toLowerCase()).includes(kw.toLowerCase()),
  );

  if (missingRequired.length > 0) {
    suggestions.push({
      id: "missing-required-skills",
      title: "Missing required skills",
      detail: `These skills are explicitly required in the JD but absent from your resume: ${missingRequired.slice(0, 5).join(", ")}${missingRequired.length > 5 ? ` (+${missingRequired.length - 5} more)` : ""}.`,
      severity: "high",
      category: "keywords",
    });
  }

  if (missingOptional.length > 0) {
    suggestions.push({
      id: "missing-keywords",
      title: "Add relevant JD keywords",
      detail: `Consider naturally incorporating: ${missingOptional.slice(0, 4).join(", ")} to improve alignment with the role.`,
      severity: "medium",
      category: "keywords",
    });
  }

  return suggestions;
}
