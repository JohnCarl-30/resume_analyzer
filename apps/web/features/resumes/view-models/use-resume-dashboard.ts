import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { listResumeAnalyses } from "../../onboarding/utils/analysis-api";
import type { ResumeSummary } from "../model/resume";
import type { ResumeAnalysisResult } from "../../editor/model/resume-analysis";

export interface DashboardStats {
  totalResumes: number;
  averageMatchRate: number;
  optimizedCount: number;
}

function mapAnalyses(fetchedAnalyses: ResumeAnalysisResult[]) {
  const orderedAnalyses = [...fetchedAnalyses].sort(
    (a, b) =>
      new Date(b.createdAt ?? b.generatedAt).getTime() -
      new Date(a.createdAt ?? a.generatedAt).getTime(),
  );

  const mapped: ResumeSummary[] = orderedAnalyses.map((analysis) => ({
    id: analysis.id ?? crypto.randomUUID(),
    candidateName:
      analysis.extractedProfile?.fullName.trim() ||
      analysis.targetRole.trim() ||
      "Untitled Analysis",
    fileName: analysis.sourceFileName ?? "Uploaded resume",
    status: "analyzed",
    uploadedAt: analysis.createdAt ?? analysis.generatedAt,
    targetRole: analysis.targetRole,
    score: analysis.score,
    missingKeywordCount: analysis.missingKeywords.length,
    suggestionCount: analysis.suggestions.length,
  }));

  const stats: DashboardStats = {
    totalResumes: orderedAnalyses.length,
    averageMatchRate:
      orderedAnalyses.length > 0
        ? Math.round(
            orderedAnalyses.reduce((sum, analysis) => sum + analysis.score, 0) /
              orderedAnalyses.length,
          )
        : 0,
    optimizedCount: orderedAnalyses.filter((analysis) => analysis.score >= 75).length,
  };

  return { orderedAnalyses, mapped, stats };
}

export function useResumeDashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [analyses, setAnalyses] = useState<ResumeAnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    totalResumes: 0,
    averageMatchRate: 0,
    optimizedCount: 0,
  });
  const [reloadToken, setReloadToken] = useState(0);

  const refetch = useCallback(() => {
    setReloadToken((token) => token + 1);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setResumes([]);
      setAnalyses([]);
      setStats({ totalResumes: 0, averageMatchRate: 0, optimizedCount: 0 });
      setError("");
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setError("");

    void listResumeAnalyses()
      .then((fetchedAnalyses) => {
        if (isCancelled) {
          return;
        }

        const next = mapAnalyses(fetchedAnalyses);
        setAnalyses(next.orderedAnalyses);
        setResumes(next.mapped);
        setStats(next.stats);
      })
      .catch((nextError) => {
        if (isCancelled) {
          return;
        }
        setResumes([]);
        setAnalyses([]);
        setStats({ totalResumes: 0, averageMatchRate: 0, optimizedCount: 0 });
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
  }, [isLoaded, isSignedIn, reloadToken]);

  return {
    title: "Review incoming resumes as they move through intake",
    description: "Track recent analyses and jump back into editing any resume.",
    resumes,
    analyses,
    isLoading,
    error,
    stats,
    refetch,
  };
}
