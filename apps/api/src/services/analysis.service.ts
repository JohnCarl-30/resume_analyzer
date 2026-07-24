import type { ResumeAnalysis, AnalysisSuggestion } from "../types/analysis.js";
import {
  createAnalysisSchema,
  createUploadedAnalysisSchema,
  createTemplateAnalysisSchema,
} from "../schemas/analysis.schema.js";
import { HttpError } from "../utils/http-error.js";
import { resumeExtractionService } from "./resume-extraction.service.js";
import { resumeParserService } from "./resume-parser.service.js";
import type { PersistedResumeAnalysis } from "../repositories/analysis.repository.js";
import { db } from "../db/client.js";
import { inMemoryAnalysisRepository } from "../repositories/in-memory-analysis.repository.js";
import { postgresAnalysisRepository } from "../repositories/postgres-analysis.repository.js";
import { accountService } from "./account.service.js";

import { aiProvider } from "../lib/ai-provider.js";
import { jdExtractionService } from "./jd-extraction.service.js";
import { resumeAnalysisService } from "./resume-analysis.service.js";

const analysisRepository = db.isConfigured
  ? postgresAnalysisRepository
  : inMemoryAnalysisRepository;

export const analysisService = {
  async listAnalyses(userId: string): Promise<PersistedResumeAnalysis[]> {
    return analysisRepository.list(userId);
  },

  async createAnalysis(input: unknown): Promise<ResumeAnalysis> {
    const payload = createAnalysisSchema.parse(input);

    const jdExtraction = await jdExtractionService.extractKeywordsFromJd(
      payload.jobDescription,
      payload.targetRole,
    );

    const analysisResult = await resumeAnalysisService.analyze({
      resumeText: payload.resumeText,
      jobDescription: payload.jobDescription,
      targetRole: jdExtraction.targetRoleTitle || payload.targetRole,
      jdKeywords: jdExtraction.keywords,
      requiredSkills: jdExtraction.requiredSkills,
    });

    return {
      targetRole: jdExtraction.targetRoleTitle || payload.targetRole,
      score: analysisResult.score,
      scoreBreakdown: analysisResult.scoreBreakdown,
      metricsFound: analysisResult.metricsFound,
      matchedKeywords: analysisResult.matchedKeywords,
      missingKeywords: analysisResult.missingKeywords,
      suggestions: analysisResult.suggestions,
      generatedAt: new Date().toISOString(),
    };
  },

  async createAnalysisFromUpload(input: {
    userId: string;
    targetRole: unknown;
    jobDescription: unknown;
    selectedTemplateId: unknown;
    resumeFile?: Express.Multer.File;
  }): Promise<PersistedResumeAnalysis> {
    const startedAt = Date.now();
    await accountService.assertCanCreateAnalysis(input.userId);

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

    const extractedProfile = await resumeExtractionService.extractProfile({
      resumeText: extracted.text,
      targetRole: analysis.targetRole,
    });

    const persisted = await analysisRepository.create({
      ...analysis,
      jobDescription: payload.jobDescription,
      selectedTemplateId: payload.selectedTemplateId,
      parsedResumeText: extracted.text,
      userId: input.userId,
      sourceFileName: input.resumeFile.originalname,
      sourceFileContentType: input.resumeFile.mimetype,
      sourceFileDataBase64: input.resumeFile.buffer.toString("base64"),
      extractedCharacterCount: extracted.text.length,
      extractedProfile,
      extractionProvider: extractedProfile ? aiProvider.getExtractionProviderLabel() : "parser",
      processingTimeMs: Date.now() - startedAt,
    });

    await accountService.recordAnalysisRedemption(input.userId, persisted.id);
    return persisted;
  },

  async createAnalysisFromTemplate(input: {
    userId: string;
    targetRole: unknown;
    jobDescription: unknown;
    selectedTemplateId: unknown;
    resumeText: string;
  }): Promise<PersistedResumeAnalysis> {
    const startedAt = Date.now();
    await accountService.assertCanCreateAnalysis(input.userId);

    const payload = createTemplateAnalysisSchema.parse({
      targetRole: input.targetRole,
      jobDescription: input.jobDescription,
      selectedTemplateId: input.selectedTemplateId,
      resumeText: input.resumeText,
    });

    const analysis = await this.createAnalysis({
      targetRole: input.targetRole,
      jobDescription: input.jobDescription,
      resumeText: input.resumeText,
    });

    const extractedProfile = await resumeExtractionService.extractProfile({
      resumeText: input.resumeText,
      targetRole: analysis.targetRole,
    });

    const persisted = await analysisRepository.create({
      ...analysis,
      jobDescription: payload.jobDescription,
      selectedTemplateId: payload.selectedTemplateId,
      parsedResumeText: input.resumeText,
      userId: input.userId,
      extractedCharacterCount: input.resumeText.length,
      extractedProfile,
      extractionProvider: extractedProfile ? aiProvider.getExtractionProviderLabel() : "parser",
      processingTimeMs: Date.now() - startedAt,
    });

    await accountService.recordAnalysisRedemption(input.userId, persisted.id);
    return persisted;
  },
  async getAnalysisById(analysisId: string, userId: string): Promise<PersistedResumeAnalysis> {
    const analysis = await analysisRepository.findById(analysisId, userId);

    if (!analysis) {
      throw new HttpError(404, "Saved analysis not found.");
    }

    return analysis;
  },

  async getAnalysisSourceFile(analysisId: string, userId: string) {
    const sourceFile = await analysisRepository.findSourceFileById(analysisId, userId);

    if (!sourceFile) {
      throw new HttpError(404, "Saved source file not found.");
    }

    return sourceFile;
  },

  async updateAnalysis(
    analysisId: string,
    userId: string,
    input: { jobDescription: string; targetRole?: string },
  ): Promise<PersistedResumeAnalysis> {
    const startedAt = Date.now();
    const existing = await this.getAnalysisById(analysisId, userId);

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
      processingTimeMs: Date.now() - startedAt,
    };

    return analysisRepository.update(analysisId, persisted);
  },
};
