import { sampleResumes } from "../model/resume";

export function useResumeDashboard() {
  return {
    title: "Review incoming resumes as they move through intake",
    description:
      "Uploads, parsing state, and handoff readiness stay visible here while the live API is still being wired.",
    resumes: sampleResumes,
  };
}
