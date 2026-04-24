import type {
  AnalysisRepository,
  CreatePersistedAnalysisRecord,
  PersistedAnalysisSourceFile,
  PersistedResumeAnalysis,
} from "./analysis.repository.js";

interface StoredResumeAnalysis extends PersistedResumeAnalysis {
  sourceFileDataBase64?: string;
}

class InMemoryAnalysisRepository implements AnalysisRepository {
  private readonly analyses = new Map<string, StoredResumeAnalysis>();

  async create(input: CreatePersistedAnalysisRecord) {
    const analysis: StoredResumeAnalysis = {
      id: crypto.randomUUID(),
      ...input,
    };

    this.analyses.set(analysis.id, analysis);

    return this.toPublicAnalysis(analysis);
  }

  async findById(id: string) {
    const analysis = this.analyses.get(id);
    return analysis ? this.toPublicAnalysis(analysis) : null;
  }

  async list() {
    return Array.from(this.analyses.values())
      .sort((left, right) => Date.parse(right.generatedAt) - Date.parse(left.generatedAt))
      .map((analysis) => this.toPublicAnalysis(analysis));
  }

  async update(id: string, record: PersistedResumeAnalysis) {
    const existingRecord = this.analyses.get(id);
    const nextRecord: StoredResumeAnalysis = {
      ...existingRecord,
      ...record,
    };

    this.analyses.set(id, nextRecord);
    return this.toPublicAnalysis(nextRecord);
  }

  async findSourceFileById(id: string): Promise<PersistedAnalysisSourceFile | null> {
    const analysis = this.analyses.get(id);

    if (!analysis?.sourceFileDataBase64 || !analysis.sourceFileContentType || !analysis.sourceFileName) {
      return null;
    }

    return {
      fileName: analysis.sourceFileName,
      contentType: analysis.sourceFileContentType,
      dataBase64: analysis.sourceFileDataBase64,
    };
  }

  private toPublicAnalysis(analysis: StoredResumeAnalysis): PersistedResumeAnalysis {
    const { sourceFileDataBase64: _sourceFileDataBase64, ...publicAnalysis } = analysis;
    return publicAnalysis;
  }
}

export const inMemoryAnalysisRepository = new InMemoryAnalysisRepository();
