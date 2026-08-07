import type { JobApplication } from "../types/job-application.js";

export interface CreateJobApplicationRecord {
  userId: string;
  company: string;
  role: string;
  status: JobApplication["status"];
  location?: string;
  jobUrl?: string;
  notes?: string;
  appliedAt?: string;
  analysisId?: string;
}

export type UpdateJobApplicationRecord = Partial<
  Omit<CreateJobApplicationRecord, "userId">
>;

export interface JobApplicationRepository {
  list(userId: string): Promise<JobApplication[]>;
  findById(id: string, userId: string): Promise<JobApplication | null>;
  create(input: CreateJobApplicationRecord): Promise<JobApplication>;
  update(
    id: string,
    userId: string,
    input: UpdateJobApplicationRecord,
  ): Promise<JobApplication | null>;
  remove(id: string, userId: string): Promise<boolean>;
}
