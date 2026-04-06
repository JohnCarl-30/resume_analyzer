import { eq } from "drizzle-orm";

import { db } from "../db/client.js";
import { resumeAnalysesTable } from "../db/schema.js";
import type {
  AnalysisRepository,
  CreatePersistedAnalysisRecord,
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
    matchedKeywords: row.matchedKeywords,
    missingKeywords: row.missingKeywords,
    suggestions: row.suggestions,
    generatedAt: row.generatedAt,
    sourceFileName: row.sourceFileName ?? undefined,
    extractedCharacterCount: row.extractedCharacterCount ?? undefined,
    extractedProfile: row.extractedProfile ?? null,
    extractionProvider: row.extractionProvider ?? undefined,
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
      matchedKeywords: input.matchedKeywords,
      missingKeywords: input.missingKeywords,
      suggestions: input.suggestions,
      generatedAt: input.generatedAt,
      sourceFileName: input.sourceFileName ?? null,
      extractedCharacterCount: input.extractedCharacterCount ?? null,
      extractedProfile: input.extractedProfile ?? null,
      extractionProvider: input.extractionProvider ?? null,
    });

    return {
      id: analysisId,
      ...input,
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
        matchedKeywords: record.matchedKeywords,
        missingKeywords: record.missingKeywords,
        suggestions: record.suggestions,
        generatedAt: record.generatedAt,
        sourceFileName: record.sourceFileName ?? null,
        extractedCharacterCount: record.extractedCharacterCount ?? null,
        extractedProfile: record.extractedProfile ?? null,
        extractionProvider: record.extractionProvider ?? null,
      })
      .where(eq(resumeAnalysesTable.id, id));

    return record;
  }
}

export const postgresAnalysisRepository = new PostgresAnalysisRepository();
