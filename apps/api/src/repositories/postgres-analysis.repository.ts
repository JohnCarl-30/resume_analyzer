import { desc, eq } from "drizzle-orm";

import { db } from "../db/client.js";
import { resumeAnalysesTable } from "../db/schema.js";
import type {
  AnalysisRepository,
  CreatePersistedAnalysisRecord,
  PersistedAnalysisSourceFile,
  PersistedResumeAnalysis,
} from "./analysis.repository.js";

function mapRowToAnalysis(
  row: typeof resumeAnalysesTable.$inferSelect,
): PersistedResumeAnalysis {
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
    generatedAt: row.generatedAt,
    sourceFileName: row.sourceFileName ?? undefined,
    sourceFileContentType: row.sourceFileContentType ?? undefined,
    extractedCharacterCount: row.extractedCharacterCount ?? undefined,
    extractedProfile: row.extractedProfile ?? null,
    extractionProvider: row.extractionProvider ?? undefined,
    createdAt: row.createdAt,
  };
}

class PostgresAnalysisRepository implements AnalysisRepository {
  async create(input: CreatePersistedAnalysisRecord) {
    if (!db.client) {
      throw new Error("Database client is not configured.");
    }

    await db.ensureSchema();

    const analysisId = crypto.randomUUID();

    await db.client.insert(resumeAnalysesTable).values({
      id: analysisId,
      targetRole: input.targetRole,
      selectedTemplateId: input.selectedTemplateId,
      jobDescription: input.jobDescription,
      parsedResumeText: input.parsedResumeText,
      score: input.score,
      metricsFound: input.metricsFound ?? null,
      matchedKeywords: input.matchedKeywords,
      missingKeywords: input.missingKeywords,
      suggestions: input.suggestions,
      generatedAt: input.generatedAt,
      sourceFileName: input.sourceFileName ?? null,
      sourceFileContentType: input.sourceFileContentType ?? null,
      sourceFileDataBase64: input.sourceFileDataBase64 ?? null,
      extractedCharacterCount: input.extractedCharacterCount ?? null,
      extractedProfile: input.extractedProfile ?? null,
      extractionProvider: input.extractionProvider ?? null,
    });

    return {
      id: analysisId,
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
    };
  }

  async findById(id: string) {
    if (!db.client) {
      return null;
    }

    await db.ensureSchema();

    const [record] = await db.client
      .select()
      .from(resumeAnalysesTable)
      .where(eq(resumeAnalysesTable.id, id))
      .limit(1);

    return record ? mapRowToAnalysis(record) : null;
  }

  async list() {
    if (!db.client) {
      return [];
    }

    await db.ensureSchema();

    const records = await db.client
      .select()
      .from(resumeAnalysesTable)
      .orderBy(desc(resumeAnalysesTable.createdAt));

    return records.map(mapRowToAnalysis);
  }

  async update(id: string, record: PersistedResumeAnalysis) {
    if (!db.client) {
      throw new Error("Database client is not configured.");
    }

    await db.ensureSchema();

    await db.client
      .update(resumeAnalysesTable)
      .set({
        targetRole: record.targetRole,
        selectedTemplateId: record.selectedTemplateId,
        jobDescription: record.jobDescription,
        parsedResumeText: record.parsedResumeText,
        score: record.score,
        metricsFound: record.metricsFound ?? null,
        matchedKeywords: record.matchedKeywords,
        missingKeywords: record.missingKeywords,
        suggestions: record.suggestions,
        generatedAt: record.generatedAt,
        sourceFileName: record.sourceFileName ?? null,
        sourceFileContentType: record.sourceFileContentType ?? null,
        extractedCharacterCount: record.extractedCharacterCount ?? null,
        extractedProfile: record.extractedProfile ?? null,
        extractionProvider: record.extractionProvider ?? null,
      })
      .where(eq(resumeAnalysesTable.id, id));

    return record;
  }

  async findSourceFileById(id: string): Promise<PersistedAnalysisSourceFile | null> {
    if (!db.client) {
      return null;
    }

    await db.ensureSchema();

    const [record] = await db.client
      .select({
        sourceFileName: resumeAnalysesTable.sourceFileName,
        sourceFileContentType: resumeAnalysesTable.sourceFileContentType,
        sourceFileDataBase64: resumeAnalysesTable.sourceFileDataBase64,
      })
      .from(resumeAnalysesTable)
      .where(eq(resumeAnalysesTable.id, id))
      .limit(1);

    if (
      !record?.sourceFileName ||
      !record.sourceFileContentType ||
      !record.sourceFileDataBase64
    ) {
      return null;
    }

    return {
      fileName: record.sourceFileName,
      contentType: record.sourceFileContentType,
      dataBase64: record.sourceFileDataBase64,
    };
  }
}

export const postgresAnalysisRepository = new PostgresAnalysisRepository();
