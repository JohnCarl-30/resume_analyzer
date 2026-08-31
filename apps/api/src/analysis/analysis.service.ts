import { BadRequestException, Inject, Injectable, NotFoundException } from "@nestjs/common";

import { AccountService } from "../account/account.service.js";
import { aiProvider } from "../lib/ai-provider.js";
import {
  createAnalysisSchema,
  createTemplateAnalysisSchema,
  createUploadedAnalysisSchema,
} from "../schemas/analysis.schema.js";
import { jdExtractionService } from "../services/jd-extraction.service.js";
import { resumeAnalysisService } from "../services/resume-analysis.service.js";
import { resumeExtractionService } from "../services/resume-extraction.service.js";
import { resumeParserService } from "../services/resume-parser.service.js";
import type { ResumeAnalysis } from "../types/analysis.js";
import type { UploadedFile } from "../types/uploaded-file.js";
import {
  ANALYSIS_REPOSITORY,
  type AnalysisRepository,
  type PersistedResumeAnalysis,
} from "./repositories/analysis.repository.js";

/**
 * Orchestrates the analysis pipeline.
 *
 * The pipeline stages themselves (JD extraction, scoring, profile extraction,
 * parsing) remain framework-free singletons under services/ -- they carry no
 * state and their AI usage already degrades to rule-based analyzers when no
 * key is configured, so wrapping each in DI would add ceremony without power.
 */
@Injectable()
export class AnalysisService {
  constructor(
    @Inject(ANALYSIS_REPOSITORY)
    private readonly analyses: AnalysisRepository,
    private readonly account: AccountService,
  ) {}

  async listAnalyses(userId: string): Promise<PersistedResumeAnalysis[]> {
    return this.analyses.list(userId);
  }

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
  }

  async createAnalysisFromUpload(input: {
    userId: string;
    targetRole: unknown;
    jobDescription: unknown;
    selectedTemplateId: unknown;
    resumeFile?: UploadedFile;
  }): Promise<PersistedResumeAnalysis> {
    const startedAt = Date.now();
    await this.account.assertCanCreateAnalysis(input.userId);

    const payload = createUploadedAnalysisSchema.parse({
      targetRole: input.targetRole,
      jobDescription: input.jobDescription,
      selectedTemplateId: input.selectedTemplateId,
    });

    if (!input.resumeFile) {
      throw new BadRequestException("Please upload a PDF or DOCX resume.");
    }

    const extracted = await resumeParserService.extractText(input.resumeFile);

    if (extracted.text.length < 30) {
      throw new BadRequestException(
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

    const persisted = await this.analyses.create({
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

    await this.account.recordAnalysisRedemption(input.userId, persisted.id);
    return persisted;
  }

  async createAnalysisFromTemplate(input: {
    userId: string;
    targetRole: unknown;
    jobDescription: unknown;
    selectedTemplateId: unknown;
    resumeText: string;
  }): Promise<PersistedResumeAnalysis> {
    const startedAt = Date.now();
    await this.account.assertCanCreateAnalysis(input.userId);

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

    const persisted = await this.analyses.create({
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

    await this.account.recordAnalysisRedemption(input.userId, persisted.id);
    return persisted;
  }

  async getAnalysisById(analysisId: string, userId: string): Promise<PersistedResumeAnalysis> {
    const analysis = await this.analyses.findById(analysisId, userId);

    if (!analysis) {
      throw new NotFoundException("Saved analysis not found.");
    }

    return analysis;
  }

  async getAnalysisSourceFile(analysisId: string, userId: string) {
    const sourceFile = await this.analyses.findSourceFileById(analysisId, userId);

    if (!sourceFile) {
      throw new NotFoundException("Saved source file not found.");
    }

    return sourceFile;
  }

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

    return this.analyses.update(analysisId, persisted);
  }
}
