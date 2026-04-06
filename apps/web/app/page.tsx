"use client";

import React, { useEffect, useState } from "react";
import { DeepFocusWizard } from "@/features/onboarding/views/deep-focus-wizard";
import { DashboardView } from "@/features/resumes/views/dashboard-view";

export default function HomePage() {
  const [view, setView] = useState<"dashboard" | "wizard">("dashboard");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextView = new URLSearchParams(window.location.search).get("analysis")
      ? "wizard"
      : "dashboard";

    setView(nextView);
  }, []);

  if (view === "wizard") {
    return <DeepFocusWizard onExit={() => setView("dashboard")} />;
  }

  return (
    <main className="relative min-h-screen bg-[color:var(--page-bg)]">
      <DashboardView onNewAnalysis={() => setView("wizard")} />
    </main>
  );
}
