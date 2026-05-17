"use client";

import { useRouter } from "next/navigation";
import { DashboardView } from "@/features/resumes/views/dashboard-view";

export default function AnalysesPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen bg-[color:var(--page-bg)]">
      <DashboardView
        onNewAnalysis={() => router.push("/analysis/new")}
        onOpenAnalysis={(analysisId) => router.push(`/analysis/${analysisId}`)}
        onViewAll={() => router.push("/analyses")}
      />
    </main>
  );
}
