import { buildApiUrl } from "../../../lib/api";
import type { ResumeAnalysisResult } from "../../editor/model/resume-analysis";

interface CreateResumeAnalysisInput {
  targetRole: string;
  jobDescription: string;
  selectedTemplateId: string;
  resumeFile: File;
}

interface ApiEnvelope<T> {
  data: T;
  error?: string;
  details?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[] | undefined>;
  };
}

function buildValidationMessage(
  payload: ApiEnvelope<ResumeAnalysisResult> | null,
  fallbackMessage: string,
) {
  if (payload?.error !== "Validation failed") {
    return payload?.error ?? fallbackMessage;
  }

  const fieldErrors = payload.details?.fieldErrors;

  if (fieldErrors) {
    const orderedFieldLabels: Record<string, string> = {
      targetRole: "Target role",
      jobDescription: "Job description",
      selectedTemplateId: "Template selection",
      resumeText: "Resume text",
    };

    const formattedErrors = Object.entries(fieldErrors)
      .flatMap(([field, messages]) =>
        (messages ?? []).map((message) => `${orderedFieldLabels[field] ?? field}: ${message}`),
      )
      .filter(Boolean);

    if (formattedErrors.length > 0) {
      return formattedErrors.join(" ");
    }
  }

  if (payload?.details?.formErrors?.length) {
    return payload.details.formErrors.join(" ");
  }

  return payload?.error ?? fallbackMessage;
}

export async function createResumeAnalysis(
  input: CreateResumeAnalysisInput,
): Promise<ResumeAnalysisResult> {
  const formData = new FormData();
  formData.set("targetRole", input.targetRole);
  formData.set("jobDescription", input.jobDescription);
  formData.set("selectedTemplateId", input.selectedTemplateId);
  formData.set("resume", input.resumeFile);

  const response = await fetch(buildApiUrl("/api/analysis/upload"), {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<ResumeAnalysisResult> | null;

  if (!response.ok || !payload?.data) {
    throw new Error(buildValidationMessage(payload, "Unable to generate analysis right now."));
  }

  return payload.data;
}

export async function getResumeAnalysis(analysisId: string): Promise<ResumeAnalysisResult> {
  const response = await fetch(buildApiUrl(`/api/analysis/${analysisId}`), {
    method: "GET",
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<ResumeAnalysisResult> | null;

  if (!response.ok || !payload?.data) {
    throw new Error(buildValidationMessage(payload, "Unable to load the saved analysis right now."));
  }

  return payload.data;
}
