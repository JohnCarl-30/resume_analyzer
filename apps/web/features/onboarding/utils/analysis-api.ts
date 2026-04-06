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
    throw new Error(payload?.error ?? "Unable to generate analysis right now.");
  }

  return payload.data;
}

export async function getResumeAnalysis(analysisId: string): Promise<ResumeAnalysisResult> {
  const response = await fetch(buildApiUrl(`/api/analysis/${analysisId}`), {
    method: "GET",
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<ResumeAnalysisResult> | null;

  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error ?? "Unable to load the saved analysis right now.");
  }

  return payload.data;
}
