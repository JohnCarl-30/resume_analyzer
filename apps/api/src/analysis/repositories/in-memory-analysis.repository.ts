import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";

import type {
  AnalysisRepository,
  CreatePersistedAnalysisRecord,
  PersistedAnalysisSourceFile,
  PersistedResumeAnalysis,
} from "./analysis.repository.js";

interface StoredResumeAnalysis extends PersistedResumeAnalysis {
  sourceFileDataBase64?: string;
}

/** Used when no database is configured. Analyses vanish with the process. */
@Injectable()
export class InMemoryAnalysisRepository implements AnalysisRepository {
  private readonly analyses = new Map<string, StoredResumeAnalysis>();

  async create(input: CreatePersistedAnalysisRecord): Promise<PersistedResumeAnalysis> {
    const analysis: StoredResumeAnalysis = { id: randomUUID(), ...input };
    this.analyses.set(analysis.id, analysis);
    return this.toPublicAnalysis(analysis);
  }

  async findById(id: string, userId: string): Promise<PersistedResumeAnalysis | null> {
    const analysis = this.analyses.get(id);
    if (!analysis || analysis.userId !== userId) {
      return null;
    }
    return this.toPublicAnalysis(analysis);
  }

  async list(userId: string): Promise<PersistedResumeAnalysis[]> {
    return Array.from(this.analyses.values())
      .filter((analysis) => analysis.userId === userId)
      .sort((left, right) => Date.parse(right.generatedAt) - Date.parse(left.generatedAt))
      .map((analysis) => this.toPublicAnalysis(analysis));
  }

  async update(id: string, record: PersistedResumeAnalysis): Promise<PersistedResumeAnalysis> {
    const nextRecord: StoredResumeAnalysis = { ...this.analyses.get(id), ...record };
    this.analyses.set(id, nextRecord);
    return this.toPublicAnalysis(nextRecord);
  }

  async findSourceFileById(
    id: string,
    userId: string,
  ): Promise<PersistedAnalysisSourceFile | null> {
    const analysis = this.analyses.get(id);

    if (!analysis || analysis.userId !== userId) {
      return null;
    }

    if (
      !analysis.sourceFileDataBase64 ||
      !analysis.sourceFileContentType ||
      !analysis.sourceFileName
    ) {
      return null;
    }

    return {
      fileName: analysis.sourceFileName,
      contentType: analysis.sourceFileContentType,
      dataBase64: analysis.sourceFileDataBase64,
    };
  }

  /** The PDF blob never leaves through list/read responses. */
  private toPublicAnalysis(analysis: StoredResumeAnalysis): PersistedResumeAnalysis {
    const { sourceFileDataBase64: _blob, ...publicAnalysis } = analysis;
    return publicAnalysis;
  }
}
