import { buildApiUrl } from "../../../lib/api";
import type { ResumeAnalysisResult } from "../../editor/model/resume-analysis";

interface CreateResumeAnalysisInput {
  targetRole: string;
  jobDescription: string;
  resumeText: string;
}

interface ApiEnvelope<T> {
  data: T;
  error?: string;
}

export async function createResumeAnalysis(
  input: CreateResumeAnalysisInput,
): Promise<ResumeAnalysisResult> {
  const response = await fetch(buildApiUrl("/api/analysis"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<ResumeAnalysisResult> | null;

  if (!response.ok || !payload?.data) {
    throw new Error(payload?.error ?? "Unable to generate analysis right now.");
  }

  return payload.data;
}
