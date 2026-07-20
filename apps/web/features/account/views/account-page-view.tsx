"use client";

import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { SessionActionsMenu } from "@/features/account/components/session-actions-menu";
import { AppShellHeader } from "@/features/auth/components/app-shell-header";
import type { AnalysisQuota } from "@/lib/account-api";
import type { AnalysisQuotaNavigationState } from "@/lib/analysis-quota-navigation";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function SpecRow({
  label,
  value,
  note,
  className,
}: {
  label: string;
  value: ReactNode;
  note?: string;
  className?: string;
}) {
  return (
    <tr className={cn("app-spec-row", className)}>
      <th scope="row">{label}</th>
      <td>
        <div className="min-w-0 font-medium text-foreground">{value}</div>
        {note ? <p className="mt-1 text-sm leading-6 text-muted-foreground">{note}</p> : null}
      </td>
    </tr>
  );
}

function SpecRowSkeleton({ label }: { label: string }) {
  return (
    <tr className="app-spec-row">
      <th scope="row">{label}</th>
      <td>
        <Skeleton className="app-skeleton h-4 w-40 max-w-full" />
      </td>
    </tr>
  );
}

interface AccountPageViewProps {
  quota: AnalysisQuota | null;
  quotaError: string;
  quotaNav: AnalysisQuotaNavigationState;
  isProfileLoaded: boolean;
  displayName: string;
  email?: string;
}

export function AccountPageView({
  quota,
  quotaError,
  quotaNav,
  isProfileLoaded,
  displayName,
  email,
}: AccountPageViewProps) {
  const quotaUsed = quota?.used ?? 0;
  const quotaLimit = quota?.limit ?? 1;
  const quotaPercent = quotaLimit > 0 ? Math.round((quotaUsed / quotaLimit) * 100) : 0;
  const profileLoading = !isProfileLoaded;
  const planLoading = quotaNav.isLoading && !quota && !quotaError;

  return (
    <>
      <AppShellHeader active="settings" quotaNav={quotaNav} />
      <main className="app-account page-enter min-h-screen bg-background text-foreground">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <header className="app-account-masthead app-surface-enter">
            <div className="min-w-0 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Account</p>
              <h1 className="app-page-title">
                Profile &amp; session
              </h1>
              <p className="max-w-prose text-sm leading-6 text-muted-foreground">
                Sign-in details, your resume-check allowance, and session controls.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0">
              <Link href="/home">
                <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
                Home
              </Link>
            </Button>
          </header>

          <div
            className="app-surface-enter mt-8 flex items-center gap-4 border-y border-border py-5"
            style={{ "--enter-delay": "60ms" } as CSSProperties}
          >
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-sm font-semibold text-foreground"
              aria-hidden="true"
            >
              {profileLoading ? (
                <Skeleton className="app-skeleton size-full rounded-full" />
              ) : (
                getInitials(displayName)
              )}
            </div>
            <div className="min-w-0 flex-1">
              {profileLoading ? (
                <div className="space-y-2" aria-busy="true">
                  <Skeleton className="app-skeleton h-5 w-44 max-w-full" />
                  <Skeleton className="app-skeleton h-4 w-56 max-w-full" />
                </div>
              ) : (
                <>
                  <p className="truncate text-base font-semibold text-foreground">{displayName}</p>
                  {email ? (
                    <p className="truncate text-sm text-muted-foreground">{email}</p>
                  ) : null}
                </>
              )}
            </div>
          </div>

          <section
            className="app-surface-enter mt-10"
            aria-labelledby="account-identity-heading"
            style={{ "--enter-delay": "100ms" } as CSSProperties}
          >
            <h2 id="account-identity-heading" className="app-section-label">
              Identity
            </h2>
            <table className="app-spec-sheet mt-4 w-full">
              <tbody>
                {profileLoading ? (
                  <>
                    <SpecRowSkeleton label="Display name" />
                    <SpecRowSkeleton label="Email" />
                  </>
                ) : (
                  <>
                    <SpecRow label="Display name" value={displayName} />
                    <SpecRow
                      label="Email"
                      value={email ?? "—"}
                      note="Used for sign-in and account recovery through Clerk."
                    />
                  </>
                )}
              </tbody>
            </table>
          </section>

          <section
            className="app-surface-enter mt-10"
            aria-labelledby="account-plan-heading"
            style={{ "--enter-delay": "140ms" } as CSSProperties}
          >
            <h2 id="account-plan-heading" className="app-section-label">
              Resume checks
            </h2>
            <table className="app-spec-sheet mt-4 w-full">
              <tbody>
                {planLoading ? (
                  <>
                    <SpecRowSkeleton label="Allowance" />
                    <tr className="app-spec-row">
                      <th scope="row">Usage</th>
                      <td>
                        <Skeleton className="app-skeleton h-2 w-full max-w-xs" />
                        <Skeleton className="app-skeleton mt-3 h-4 w-full max-w-md" />
                      </td>
                    </tr>
                  </>
                ) : (
                  <>
                    <SpecRow
                      label="Allowance"
                      value={
                        quota ? (
                          <span className="text-data">{`${quotaUsed} of ${quotaLimit} used`}</span>
                        ) : (
                          "—"
                        )
                      }
                    />
                    <tr className="app-spec-row">
                      <th scope="row">Usage</th>
                      <td>
                        <Progress
                          value={quotaPercent}
                          className="max-w-xs"
                          aria-label={`${quotaUsed} of ${quotaLimit} checks used`}
                        />
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          {quota?.canAnalyze
                            ? "Your free check is ready. Upload a resume from Home to run analysis."
                            : "Your saved check stays available. Open it to review results or tailor to a new job post."}
                        </p>
                        {quotaError ? (
                          <p className="mt-2 text-sm text-destructive">{quotaError}</p>
                        ) : null}
                      </td>
                    </tr>
                    {quota?.analysisId ? (
                      <SpecRow
                        label="Saved analysis"
                        value={
                          <Link
                            href={`/analysis/${quota.analysisId}`}
                            className="motion-link font-medium text-primary underline-offset-4 hover:underline"
                          >
                            Open saved check
                          </Link>
                        }
                      />
                    ) : null}
                  </>
                )}
              </tbody>
            </table>
          </section>

          <section
            className="app-surface-enter mt-10"
            aria-labelledby="account-session-heading"
            style={{ "--enter-delay": "180ms" } as CSSProperties}
          >
            <h2 id="account-session-heading" className="app-section-label">
              Session
            </h2>
            <table className="app-spec-sheet mt-4 w-full">
              <tbody>
                <SpecRow
                  label="Status"
                  value={profileLoading ? <Skeleton className="app-skeleton h-4 w-20" /> : "Signed in"}
                  note="Sign out to switch accounts or use a different email."
                />
                <tr className="app-spec-row">
                  <th scope="row">Actions</th>
                  <td>
                    <SessionActionsMenu />
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </>
  );
}
