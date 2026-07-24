import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

import { listResumeAnalyses } from "../../onboarding/utils/analysis-api";
import type { ResumeSummary } from "../model/resume";
import type { ResumeAnalysisResult } from "../../editor/model/resume-analysis";
import { queryKeys } from "@/lib/query/keys";

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

const emptyStats: DashboardStats = {
  totalResumes: 0,
  averageMatchRate: 0,
  optimizedCount: 0,
};

export function useResumeDashboard() {
  const { isLoaded, isSignedIn } = useAuth();

  const query = useQuery({
    queryKey: queryKeys.analyses,
    queryFn: listResumeAnalyses,
    enabled: isLoaded && Boolean(isSignedIn),
  });

  const mapped = query.data ? mapAnalyses(query.data) : null;

  return {
    title: "Review incoming resumes as they move through intake",
    description: "Track recent analyses and jump back into editing any resume.",
    resumes: mapped?.mapped ?? [],
    analyses: mapped?.orderedAnalyses ?? [],
    isLoading: !isLoaded || (Boolean(isSignedIn) && query.isPending),
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Unable to load analyses."
      : "",
    stats: mapped?.stats ?? emptyStats,
    refetch: () => {
      void query.refetch();
    },
  };
}
