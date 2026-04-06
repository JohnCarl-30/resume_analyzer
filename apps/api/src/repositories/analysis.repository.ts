import type { ResumeAnalysis } from "../types/analysis.js";

export interface CreatePersistedAnalysisRecord
  extends Omit<ResumeAnalysis, "id" | "jobDescription" | "selectedTemplateId"> {
  jobDescription: string;
  parsedResumeText: string;
  selectedTemplateId: string;
  sourceFileContentType?: string;
  sourceFileDataBase64?: string;
}

export interface PersistedResumeAnalysis extends ResumeAnalysis {
  id: string;
  jobDescription: string;
  selectedTemplateId: string;
  parsedResumeText: string;
  sourceFileContentType?: string;
}

export interface PersistedAnalysisSourceFile {
  fileName: string;
  contentType: string;
  dataBase64: string;
}

export interface AnalysisRepository {
  create(input: CreatePersistedAnalysisRecord): Promise<PersistedResumeAnalysis>;
  findById(id: string): Promise<PersistedResumeAnalysis | null>;
  update(id: string, record: PersistedResumeAnalysis): Promise<PersistedResumeAnalysis>;
  findSourceFileById(id: string): Promise<PersistedAnalysisSourceFile | null>;
}
