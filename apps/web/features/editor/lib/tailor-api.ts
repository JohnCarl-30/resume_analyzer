import { apiClient } from "@/lib/api-instance";

import type { ResumeForm } from "../model/resume-form";
import type { ResumeTailorDraft } from "../model/resume-tailor-draft";

export interface TailorResumeRequest {
  targetRole: string;
  jobDescription: string;
  missingKeywords: string[];
  matchedKeywords: string[];
  form: Pick<ResumeForm, "personalInfo" | "experience">;
}

export async function tailorResumeDraft(input: TailorResumeRequest): Promise<ResumeTailorDraft> {
  return apiClient.post<ResumeTailorDraft>("/api/enhance/tailor-resume", input);
}
