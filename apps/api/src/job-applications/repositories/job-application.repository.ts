import type { JobApplication } from "../../types/job-application.js";

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

/**
 * Every method takes the caller's userId and answers only for that user; a
 * record belonging to someone else is indistinguishable from one that does
 * not exist.
 */
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

/** Injection token: the implementation depends on whether Postgres is configured. */
export const JOB_APPLICATION_REPOSITORY = Symbol("JOB_APPLICATION_REPOSITORY");
