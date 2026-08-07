import type { ApiError } from "@/lib/api-client";
import { apiClient } from "@/lib/api-instance";
import type {
  JobApplication,
  JobApplicationStatus,
} from "../model/job-application";

export interface CreateJobApplicationPayload {
  company: string;
  role: string;
  status: JobApplicationStatus;
  location?: string;
  jobUrl?: string;
  notes?: string;
  appliedAt?: string;
  analysisId?: string;
}

export type UpdateJobApplicationPayload = Partial<CreateJobApplicationPayload>;

function buildErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    if ("fieldErrors" in error) {
      const fieldErrors = (error as ApiError).fieldErrors;

      if (fieldErrors) {
        const formatted = Object.entries(fieldErrors)
          .flatMap(([, messages]) => messages ?? [])
          .filter(Boolean);

        if (formatted.length > 0) {
          return formatted.join(" ");
        }
      }
    }

    return error.message || fallback;
  }

  return fallback;
}

export async function listJobApplications(): Promise<JobApplication[]> {
  try {
    return await apiClient.get<JobApplication[]>("/api/applications");
  } catch (error) {
    throw new Error(
      buildErrorMessage(error, "Unable to load your job applications right now."),
    );
  }
}

export async function createJobApplication(
  payload: CreateJobApplicationPayload,
): Promise<JobApplication> {
  try {
    return await apiClient.post<JobApplication>("/api/applications", payload);
  } catch (error) {
    throw new Error(buildErrorMessage(error, "Unable to save this application."));
  }
}

export async function updateJobApplication(
  id: string,
  payload: UpdateJobApplicationPayload,
): Promise<JobApplication> {
  try {
    return await apiClient.patch<JobApplication>(`/api/applications/${id}`, payload);
  } catch (error) {
    throw new Error(buildErrorMessage(error, "Unable to update this application."));
  }
}

export async function deleteJobApplication(id: string): Promise<void> {
  try {
    await apiClient.delete<void>(`/api/applications/${id}`);
  } catch (error) {
    throw new Error(buildErrorMessage(error, "Unable to delete this application."));
  }
}
