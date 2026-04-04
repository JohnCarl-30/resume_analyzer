"use client";

import React, { useState } from "react";
import { DeepFocusWizard } from "@/features/onboarding/views/deep-focus-wizard";
import { DashboardView } from "@/features/resumes/views/dashboard-view";

export default function HomePage() {
  const [view, setView] = useState<"dashboard" | "wizard">("dashboard");

  if (view === "wizard") {
    return <DeepFocusWizard onExit={() => setView("dashboard")} />;
  }

  return (
    <main className="relative min-h-screen bg-[color:var(--page-bg)]">
      <DashboardView onNewAnalysis={() => setView("wizard")} />
    </main>
  );
}
