import { useEffect, useState } from "react";
import { listResumeAnalyses } from "../../onboarding/utils/analysis-api";
import type { ResumeSummary } from "../model/resume";

export function useResumeDashboard() {
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCancelled = false;

    void listResumeAnalyses()
      .then((analyses) => {
        if (isCancelled) {
          return;
        }

        const mapped: ResumeSummary[] = analyses.map((analysis) => ({
          id: analysis.id ?? crypto.randomUUID(),
          candidateName:
            analysis.extractedProfile?.fullName.trim() ||
            analysis.targetRole.trim() ||
            "Untitled Analysis",
          fileName: analysis.sourceFileName ?? "Uploaded resume",
          status: "analyzed",
          uploadedAt: analysis.createdAt ?? analysis.generatedAt,
        }));

        setResumes(mapped);
      })
      .catch((nextError) => {
        if (isCancelled) {
          return;
        }
        setError(nextError instanceof Error ? nextError.message : "Unable to load analyses.");
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  return {
    title: "Review incoming resumes as they move through intake",
    description: "Track recent analyses and jump back into editing any resume.",
    resumes,
    isLoading,
    error,
  };
}
