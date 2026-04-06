import type {
  AnalysisRepository,
  CreatePersistedAnalysisRecord,
  PersistedResumeAnalysis,
} from "./analysis.repository.js";

class InMemoryAnalysisRepository implements AnalysisRepository {
  private readonly analyses = new Map<string, PersistedResumeAnalysis>();

  async create(input: CreatePersistedAnalysisRecord) {
    const analysis: PersistedResumeAnalysis = {
      id: crypto.randomUUID(),
      ...input,
    };

    this.analyses.set(analysis.id, analysis);

    return analysis;
  }

  async findById(id: string) {
    return this.analyses.get(id) ?? null;
  }
}

export const inMemoryAnalysisRepository = new InMemoryAnalysisRepository();
