"use client";

import { useRouter } from "next/navigation";
import { DashboardView } from "@/features/resumes/views/dashboard-view";

export function AnalysesPageClient() {
  const router = useRouter();

  return (
    <DashboardView
      onNewAnalysis={() => router.push("/analysis/new")}
      onOpenAnalysis={(analysisId) => router.push(`/analysis/${analysisId}`)}
      onViewAll={() => router.push("/analyses")}
    />
  );
}
