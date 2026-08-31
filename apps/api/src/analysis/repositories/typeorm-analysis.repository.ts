import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "node:crypto";
import { Repository, type FindOptionsSelect } from "typeorm";

import { ResumeAnalysisEntity } from "../../database/entities/resume-analysis.entity.js";
import type {
  AnalysisRepository,
  CreatePersistedAnalysisRecord,
  PersistedAnalysisSourceFile,
  PersistedResumeAnalysis,
} from "./analysis.repository.js";

/**
 * Columns for analysis JSON responses. Deliberately excludes the base64 PDF
 * blob and the embedding vectors, matching the Drizzle repository's
 * analysisPublicColumns -- a list response otherwise ships megabytes of
 * base64 per row.
 */
export const PUBLIC_COLUMNS: FindOptionsSelect<ResumeAnalysisEntity> = {
  id: true,
  targetRole: true,
  selectedTemplateId: true,
  jobDescription: true,
  parsedResumeText: true,
  score: true,
  metricsFound: true,
  matchedKeywords: true,
  missingKeywords: true,
  suggestions: true,
  generatedAt: true,
  sourceFileName: true,
  sourceFileContentType: true,
  extractedCharacterCount: true,
  extractedProfile: true,
  extractionProvider: true,
  processingTimeMs: true,
  userId: true,
  createdAt: true,
};

/** The entity stores timestamptz as Date; the API has always spoken ISO strings. */
function mapEntity(row: ResumeAnalysisEntity): PersistedResumeAnalysis {
  return {
    id: row.id,
    targetRole: row.targetRole,
    selectedTemplateId: row.selectedTemplateId,
    jobDescription: row.jobDescription,
    parsedResumeText: row.parsedResumeText,
    score: row.score,
    metricsFound: row.metricsFound ?? undefined,
    matchedKeywords: row.matchedKeywords,
    missingKeywords: row.missingKeywords,
    suggestions: row.suggestions,
    generatedAt: row.generatedAt.toISOString(),
    sourceFileName: row.sourceFileName ?? undefined,
    sourceFileContentType: row.sourceFileContentType ?? undefined,
    extractedCharacterCount: row.extractedCharacterCount ?? undefined,
    extractedProfile: row.extractedProfile ?? null,
    extractionProvider: row.extractionProvider ?? undefined,
    processingTimeMs: row.processingTimeMs ?? undefined,
    userId: row.userId ?? undefined,
    createdAt: row.createdAt?.toISOString(),
  };
}

@Injectable()
export class TypeOrmAnalysisRepository implements AnalysisRepository {
  constructor(
    @InjectRepository(ResumeAnalysisEntity)
    private readonly analyses: Repository<ResumeAnalysisEntity>,
  ) {}

  async create(input: CreatePersistedAnalysisRecord): Promise<PersistedResumeAnalysis> {
    const id = randomUUID();
    const createdAt = new Date();

    await this.analyses.insert({
      id,
      targetRole: input.targetRole,
      selectedTemplateId: input.selectedTemplateId,
      jobDescription: input.jobDescription,
      parsedResumeText: input.parsedResumeText,
      score: input.score,
      metricsFound: input.metricsFound ?? null,
      matchedKeywords: input.matchedKeywords,
      missingKeywords: input.missingKeywords,
      suggestions: input.suggestions,
      generatedAt: new Date(input.generatedAt),
      sourceFileName: input.sourceFileName ?? null,
      sourceFileContentType: input.sourceFileContentType ?? null,
      sourceFileDataBase64: input.sourceFileDataBase64 ?? null,
      extractedCharacterCount: input.extractedCharacterCount ?? null,
      extractedProfile: input.extractedProfile ?? null,
      extractionProvider: input.extractionProvider ?? null,
      processingTimeMs: input.processingTimeMs ?? null,
      userId: input.userId,
      createdAt,
      jobEmbedding: null,
      resumeEmbedding: null,
      pipelineStages: null,
      evaluationMetrics: null,
      fewShotExamplesUsed: null,
    });

    return {
      id,
      targetRole: input.targetRole,
      selectedTemplateId: input.selectedTemplateId,
      jobDescription: input.jobDescription,
      parsedResumeText: input.parsedResumeText,
      score: input.score,
      metricsFound: input.metricsFound,
      matchedKeywords: input.matchedKeywords,
      missingKeywords: input.missingKeywords,
      suggestions: input.suggestions,
      generatedAt: input.generatedAt,
      sourceFileName: input.sourceFileName,
      sourceFileContentType: input.sourceFileContentType,
      extractedCharacterCount: input.extractedCharacterCount,
      extractedProfile: input.extractedProfile,
      extractionProvider: input.extractionProvider,
      processingTimeMs: input.processingTimeMs,
      userId: input.userId,
      createdAt: createdAt.toISOString(),
    };
  }

  async findById(id: string, userId: string): Promise<PersistedResumeAnalysis | null> {
    const row = await this.analyses.findOne({ select: PUBLIC_COLUMNS, where: { id } });

    if (!row || row.userId !== userId) {
      return null;
    }

    return mapEntity(row);
  }

  async list(userId: string): Promise<PersistedResumeAnalysis[]> {
    const rows = await this.analyses.find({
      select: PUBLIC_COLUMNS,
      where: { userId },
      order: { createdAt: "DESC" },
    });

    return rows.map(mapEntity);
  }

  async update(id: string, record: PersistedResumeAnalysis): Promise<PersistedResumeAnalysis> {
    await this.analyses.update(
      { id },
      {
        targetRole: record.targetRole,
        selectedTemplateId: record.selectedTemplateId,
        jobDescription: record.jobDescription,
        parsedResumeText: record.parsedResumeText,
        score: record.score,
        metricsFound: record.metricsFound ?? null,
        matchedKeywords: record.matchedKeywords,
        missingKeywords: record.missingKeywords,
        suggestions: record.suggestions,
        generatedAt: new Date(record.generatedAt),
        sourceFileName: record.sourceFileName ?? null,
        sourceFileContentType: record.sourceFileContentType ?? null,
        extractedCharacterCount: record.extractedCharacterCount ?? null,
        extractedProfile: record.extractedProfile ?? null,
        extractionProvider: record.extractionProvider ?? null,
        processingTimeMs: record.processingTimeMs ?? null,
      },
    );

    return record;
  }

  async findSourceFileById(
    id: string,
    userId: string,
  ): Promise<PersistedAnalysisSourceFile | null> {
    const row = await this.analyses.findOne({
      select: {
        userId: true,
        sourceFileName: true,
        sourceFileContentType: true,
        sourceFileDataBase64: true,
      },
      where: { id },
    });

    if (row?.userId !== userId) {
      return null;
    }

    if (!row?.sourceFileName || !row.sourceFileContentType || !row.sourceFileDataBase64) {
      return null;
    }

    return {
      fileName: row.sourceFileName,
      contentType: row.sourceFileContentType,
      dataBase64: row.sourceFileDataBase64,
    };
  }
}
