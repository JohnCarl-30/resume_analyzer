export interface ResumeAnalysisJobInput {
  resumeId: string;
  promptVersion: string;
}

export async function enqueueResumeAnalysisJob(input: ResumeAnalysisJobInput) {
  return {
    status: "queued" as const,
    ...input,
  };
}
