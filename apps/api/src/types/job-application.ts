export const JOB_APPLICATION_STATUSES = [
  "saved",
  "applied",
  "interviewing",
  "offer",
  "rejected",
] as const;

export type JobApplicationStatus = (typeof JOB_APPLICATION_STATUSES)[number];

export interface JobApplication {
  id: string;
  userId: string;
  company: string;
  role: string;
  status: JobApplicationStatus;
  location?: string;
  jobUrl?: string;
  notes?: string;
  /** ISO date the resume/application was submitted, if any. */
  appliedAt?: string;
  /** Optional link to a saved resume analysis used for this application. */
  analysisId?: string;
  createdAt: string;
  updatedAt: string;
}
