import { useEffect, useState } from "react";
import { listResumeAnalyses } from "../../onboarding/utils/analysis-api";
import type { ResumeSummary } from "../model/resume";
import type { ResumeAnalysisResult } from "../../editor/model/resume-analysis";

export interface DashboardStats {
  totalResumes: number;
  averageMatchRate: number;
  optimizedCount: number;
}

export function useResumeDashboard() {
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [analyses, setAnalyses] = useState<ResumeAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    totalResumes: 0,
    averageMatchRate: 0,
    optimizedCount: 0,
  });

  useEffect(() => {
    let isCancelled = false;

    void listResumeAnalyses()
      .then((fetchedAnalyses) => {
        if (isCancelled) {
          return;
        }

        setAnalyses(fetchedAnalyses);

        const mapped: ResumeSummary[] = fetchedAnalyses.map((analysis) => ({
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

        // Compute stats from analyses
        const computedStats: DashboardStats = {
          totalResumes: fetchedAnalyses.length,
          averageMatchRate:
            fetchedAnalyses.length > 0
              ? Math.round(
                  fetchedAnalyses.reduce((sum, a) => sum + a.score, 0) / fetchedAnalyses.length,
                )
              : 0,
          // Count analyses with score above 75 or with significant updates (arbitrary threshold)
          optimizedCount: fetchedAnalyses.filter((a) => a.score > 75).length,
        };

        setStats(computedStats);
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
    analyses,
    isLoading,
    error,
    stats,
  };
}
