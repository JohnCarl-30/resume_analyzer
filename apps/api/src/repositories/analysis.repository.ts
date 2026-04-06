import type { ResumeAnalysis } from "../types/analysis.js";

export interface CreatePersistedAnalysisRecord
  extends Omit<ResumeAnalysis, "id" | "jobDescription" | "selectedTemplateId"> {
  jobDescription: string;
  parsedResumeText: string;
  selectedTemplateId: string;
}

export interface PersistedResumeAnalysis extends ResumeAnalysis {
  id: string;
  jobDescription: string;
  selectedTemplateId: string;
  parsedResumeText: string;
}

export interface AnalysisRepository {
  create(input: CreatePersistedAnalysisRecord): Promise<PersistedResumeAnalysis>;
  findById(id: string): Promise<PersistedResumeAnalysis | null>;
  update(id: string, record: PersistedResumeAnalysis): Promise<PersistedResumeAnalysis>;
}
