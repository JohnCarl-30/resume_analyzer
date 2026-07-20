"use client";

import { AppShellHeader } from "@/features/auth/components/app-shell-header";
import type { ResumeSummary } from "@/features/resumes/model/resume";
import type { AnalysisQuota } from "@/lib/account-api";
import type { AnalysisQuotaNavigationState } from "@/lib/analysis-quota-navigation";

import { HomeIdentityBar } from "../components/home-identity-bar";
import { SavedChecksPanel } from "../components/saved-checks-panel";

interface HomePageViewProps {
  quota: AnalysisQuota | null;
  quotaNav: AnalysisQuotaNavigationState;
  quotaError: string;
  isProfileLoaded: boolean;
  displayName: string;
  email?: string;
  initials: string;
  resumes: ResumeSummary[];
  resumesLoading: boolean;
  resumesError: string;
  onNewAnalysis: () => void;
  onScratchBuilder: () => void;
  onQuotaRetry: () => void;
  onResumesRetry: () => void;
  onOpenAnalysis: (analysisId: string) => void;
}

export function HomePageView({
  quota,
  quotaNav,
  quotaError,
  isProfileLoaded,
  displayName,
  email,
  initials,
  resumes,
  resumesLoading,
  resumesError,
  onNewAnalysis,
  onScratchBuilder,
  onQuotaRetry,
  onResumesRetry,
  onOpenAnalysis,
}: HomePageViewProps) {
  return (
    <>
      <AppShellHeader active="home" quotaNav={quotaNav} />
      <main id="home-main" className="app-home min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="app-home-launchpad">
            <HomeIdentityBar
              quota={quota}
              quotaNav={quotaNav}
              quotaError={quotaError}
              isProfileLoaded={isProfileLoaded}
              displayName={displayName}
              email={email}
              initials={initials}
              onNewAnalysis={onNewAnalysis}
              onScratchBuilder={onScratchBuilder}
              onQuotaRetry={onQuotaRetry}
            />
            <SavedChecksPanel
              quotaNav={quotaNav}
              resumes={resumes}
              isLoading={resumesLoading}
              error={resumesError}
              onNewAnalysis={onNewAnalysis}
              onScratchBuilder={onScratchBuilder}
              onOpenAnalysis={onOpenAnalysis}
              onRefetch={onResumesRetry}
              layout="workbench"
            />
          </div>
        </div>
      </main>
    </>
  );
}
