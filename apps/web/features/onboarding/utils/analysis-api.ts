import { type ApiError, ANALYSIS_REQUEST_TIMEOUT_MS } from "../../../lib/api-client";
import { apiClient } from "../../../lib/api-instance";
import type { ResumeAnalysisResult } from "../../editor/model/resume-analysis";
import { resumeFormToText } from "../../editor/model/resume-form";

interface CreateResumeAnalysisInput {
  targetRole: string;
  jobDescription: string;
  selectedTemplateId: string;
  resumeFile: File;
}

interface CreateTemplateAnalysisInput {
  targetRole: string;
  jobDescription: string;
  selectedTemplateId: string;
  resumeText: string;
}

function buildErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    if (error.message.includes("Request timeout after")) {
      return "This resume check is taking longer than expected. Please wait a moment and try again.";
    }

    if ("fieldErrors" in error && error.fieldErrors) {
      const orderedFieldLabels: Record<string, string> = {
        targetRole: "Target role",
        jobDescription: "Job description",
        selectedTemplateId: "Resume style",
        resumeText: "Resume text",
      };

      const fieldErrors = (error as ApiError).fieldErrors;
      if (fieldErrors) {
        const formattedErrors = Object.entries(fieldErrors)
          .flatMap(([field, messages]) =>
            (messages ?? []).map((message) => `${orderedFieldLabels[field] ?? field}: ${message}`),
          )
          .filter(Boolean);

        if (formattedErrors.length > 0) {
          return formattedErrors.join(" ");
        }
      }
    }
    return error.message || fallback;
  }
  return fallback;
}

export async function createResumeAnalysis(
  input: CreateResumeAnalysisInput,
): Promise<ResumeAnalysisResult> {
  try {
    const formData = new FormData();
    formData.set("targetRole", input.targetRole);
    formData.set("jobDescription", input.jobDescription);
    formData.set("selectedTemplateId", input.selectedTemplateId);
    formData.set("resume", input.resumeFile);

    return await apiClient.post<ResumeAnalysisResult>("/api/analysis/upload", formData, {
      isFormData: true,
      timeout: ANALYSIS_REQUEST_TIMEOUT_MS,
    });
  } catch (error) {
    throw new Error(buildErrorMessage(error, "Unable to check this resume right now."));
  }
}

export async function createAnalysisFromTemplate(
  input: CreateTemplateAnalysisInput,
): Promise<ResumeAnalysisResult> {
  try {
    return await apiClient.post<ResumeAnalysisResult>("/api/analysis/template", input, {
      timeout: ANALYSIS_REQUEST_TIMEOUT_MS,
    });
  } catch (error) {
    throw new Error(buildErrorMessage(error, "Unable to check this resume right now."));
  }
}

export async function getResumeAnalysis(analysisId: string): Promise<ResumeAnalysisResult> {
  try {
    return await apiClient.get<ResumeAnalysisResult>(`/api/analysis/${analysisId}`);
  } catch (error) {
    throw new Error(buildErrorMessage(error, "Unable to load the saved resume check right now."));
  }
}

export async function listResumeAnalyses(): Promise<ResumeAnalysisResult[]> {
  try {
    return await apiClient.get<ResumeAnalysisResult[]>("/api/analysis");
  } catch (error) {
    throw new Error(buildErrorMessage(error, "Unable to load saved resume checks right now."));
  }
}

export function getResumeAnalysisSourceUrl(analysisId: string) {
  return `/api/analysis/${analysisId}/source`;
}

export interface ResumeAnalysisSourcePreview {
  sourceUrl: string;
  previewUrl: string | null;
}

export async function loadResumeAnalysisSourcePreview(
  analysisId: string,
): Promise<ResumeAnalysisSourcePreview> {
  try {
    const { blob, contentType } = await apiClient.getBlob(
      getResumeAnalysisSourceUrl(analysisId),
    );
    const sourceUrl = URL.createObjectURL(blob);

    return {
      sourceUrl,
      previewUrl: contentType === "application/pdf" ? sourceUrl : null,
    };
  } catch {
    throw new Error("Unable to load the saved resume file right now.");
  }
}

export async function updateResumeAnalysis(
  analysisId: string,
  input: { jobDescription: string; targetRole?: string },
): Promise<ResumeAnalysisResult> {
  try {
    return await apiClient.patch<ResumeAnalysisResult>(`/api/analysis/${analysisId}`, input, {
      timeout: ANALYSIS_REQUEST_TIMEOUT_MS,
    });
  } catch (error) {
    throw new Error(buildErrorMessage(error, "Failed to update this resume check."));
  }
}
