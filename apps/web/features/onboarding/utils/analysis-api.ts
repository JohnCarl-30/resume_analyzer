import { type ApiError } from "../../../lib/api-client";
import { apiClient } from "../../../lib/api-instance";
import { buildApiUrl } from "../../../lib/api";
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
    if ("fieldErrors" in error && error.fieldErrors) {
      const orderedFieldLabels: Record<string, string> = {
        targetRole: "Target role",
        jobDescription: "Job description",
        selectedTemplateId: "Template selection",
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

    return await apiClient.post<ResumeAnalysisResult>("/api/analysis/upload", formData, true);
  } catch (error) {
    throw new Error(buildErrorMessage(error, "Unable to generate analysis right now."));
  }
}

export async function createAnalysisFromTemplate(
  input: CreateTemplateAnalysisInput,
): Promise<ResumeAnalysisResult> {
  try {
    return await apiClient.post<ResumeAnalysisResult>("/api/analysis/template", input);
  } catch (error) {
    throw new Error(buildErrorMessage(error, "Unable to generate analysis right now."));
  }
}

export async function getResumeAnalysis(analysisId: string): Promise<ResumeAnalysisResult> {
  try {
    return await apiClient.get<ResumeAnalysisResult>(`/api/analysis/${analysisId}`);
  } catch (error) {
    throw new Error(buildErrorMessage(error, "Unable to load the saved analysis right now."));
  }
}

export async function listResumeAnalyses(): Promise<ResumeAnalysisResult[]> {
  try {
    return await apiClient.get<ResumeAnalysisResult[]>("/api/analysis");
  } catch (error) {
    throw new Error(buildErrorMessage(error, "Unable to load analyses right now."));
  }
}

export function getResumeAnalysisSourceUrl(analysisId: string) {
  return buildApiUrl(`/api/analysis/${analysisId}/source`);
}

export async function updateResumeAnalysis(
  analysisId: string,
  input: { jobDescription: string; targetRole?: string },
): Promise<ResumeAnalysisResult> {
  try {
    return await apiClient.patch<ResumeAnalysisResult>(`/api/analysis/${analysisId}`, input);
  } catch (error) {
    throw new Error(buildErrorMessage(error, "Failed to update resume analysis."));
  }
}
