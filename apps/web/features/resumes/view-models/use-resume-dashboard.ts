import { sampleResumes } from "../model/resume";

export function useResumeDashboard() {
  return {
    title: "Resume ingestion and analysis",
    description:
      "Track uploads, parsing, and analysis states before you wire the real API.",
    resumes: sampleResumes,
  };
}
