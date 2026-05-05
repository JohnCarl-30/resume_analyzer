"use client";

import { useRouter } from "next/navigation";
import { DashboardView } from "@/features/resumes/views/dashboard-view";

export default function AnalysesPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen bg-[color:var(--page-bg)]">
      <DashboardView
        onNewAnalysis={() => router.push("/create-resume")}
        onOpenAnalysis={(analysisId) => router.push(`/create-resume/${analysisId}`)}
        onViewAll={() => router.push("/analyses")}
      />
    </main>
  );
}
