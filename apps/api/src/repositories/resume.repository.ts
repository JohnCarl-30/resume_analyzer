import type { Resume } from "../types/resume.js";

export interface CreateResumeRecord {
  fileName: string;
  storageKey: string;
  candidateName: string;
  status: Resume["status"];
  uploadedAt: string;
}

export interface ResumeRepository {
  list(): Promise<Resume[]>;
  findById(id: string): Promise<Resume | null>;
  create(input: CreateResumeRecord): Promise<Resume>;
}
