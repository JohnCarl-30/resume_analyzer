"use client";

import { AppShellHeader } from "@/features/auth/components/app-shell-header";
import type { AnalysisQuota } from "@/lib/account-api";
import type { AnalysisQuotaNavigationState } from "@/lib/analysis-quota-navigation";

import { HomeIdentityBar } from "../components/home-identity-bar";
import { SavedChecksPanel } from "../components/saved-checks-panel";

interface HomePageViewProps {
  quota: AnalysisQuota | null;
  quotaNav: AnalysisQuotaNavigationState;
  quotaError: string;
  onNewAnalysis: () => void;
  onScratchBuilder: () => void;
  onQuotaRetry: () => void;
  onOpenAnalysis: (analysisId: string) => void;
}

export function HomePageView({
  quota,
  quotaNav,
  quotaError,
  onNewAnalysis,
  onScratchBuilder,
  onQuotaRetry,
  onOpenAnalysis,
}: HomePageViewProps) {
  return (
    <>
      <AppShellHeader active="home" quotaNav={quotaNav} />
      <main id="home-main" className="app-home min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-10">
          <div className="app-home-workbench">
            <HomeIdentityBar
              quota={quota}
              quotaNav={quotaNav}
              quotaError={quotaError}
              onNewAnalysis={onNewAnalysis}
              onScratchBuilder={onScratchBuilder}
              onQuotaRetry={onQuotaRetry}
            />
            <SavedChecksPanel
              quotaNav={quotaNav}
              onNewAnalysis={onNewAnalysis}
              onScratchBuilder={onScratchBuilder}
              onOpenAnalysis={onOpenAnalysis}
              layout="workbench"
            />
          </div>
        </div>
      </main>
    </>
  );
}
