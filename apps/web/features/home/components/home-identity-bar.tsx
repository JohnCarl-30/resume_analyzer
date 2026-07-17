"use client";

import Link from "next/link";
import { Pencil1Icon, PlusIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { AnalysisQuota } from "@/lib/account-api";
import type { AnalysisQuotaNavigationState } from "@/lib/analysis-quota-navigation";
import { cn } from "@/lib/utils";

import { HomeIdentitySkeleton } from "./home-identity-skeleton";

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

function getFirstName(displayName: string) {
  const first = displayName.trim().split(/\s+/)[0];
  return first && first !== "Your" ? first : null;
}

interface HomeIdentityBarProps {
  quota: AnalysisQuota | null;
  quotaNav: AnalysisQuotaNavigationState;
  quotaError: string;
  onNewAnalysis: () => void;
  onScratchBuilder: () => void;
  onQuotaRetry: () => void;
  className?: string;
}

export function HomeIdentityBar({
  quota,
  quotaNav,
  quotaError,
  onNewAnalysis,
  onScratchBuilder,
  onQuotaRetry,
  className,
}: HomeIdentityBarProps) {
  const { user, isLoaded } = useUser();
  const quotaLoading = quotaNav.isLoading;

  const isBootstrapping = !isLoaded || (quotaLoading && !quota && !quotaError);

  if (isBootstrapping) {
    return <HomeIdentitySkeleton className={className} />;
  }

  const displayName =
    user?.fullName?.trim() ||
    user?.primaryEmailAddress?.emailAddress ||
    "Your account";
  const firstName = getFirstName(displayName);
  const email = user?.primaryEmailAddress?.emailAddress;
  const initials = getInitials(displayName);
  const quotaUsed = quota?.used ?? 0;
  const quotaLimit = quota?.limit ?? 1;
  const quotaPercent = quotaLimit > 0 ? Math.round((quotaUsed / quotaLimit) * 100) : 0;

  const planLabel = quotaError
    ? "Plan unavailable"
    : quotaNav.canUpload
      ? "Check ready"
      : "Check used";

  return (
    <aside
      className={cn("app-workbench-aside", className)}
      aria-label="Your workspace"
    >
      <div className="flex min-w-0 items-start gap-3">
        <div
          className="app-home-avatar flex size-11 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-foreground"
          aria-label={`Signed in as ${displayName}`}
        >
          <span aria-hidden="true">{initials}</span>
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold tracking-tight text-foreground text-balance">
            {firstName ? `Welcome, ${firstName}` : "Welcome back"}
          </h1>
          {email ? (
            <p className="mt-0.5 truncate text-caption text-muted-foreground">{email}</p>
          ) : null}
        </div>
      </div>

      <div className="app-workbench-quota space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "app-plan-pill",
              quotaNav.canUpload && !quotaError ? "app-plan-pill-ready" : "app-plan-pill-muted",
            )}
          >
            {planLabel}
          </span>
          {quota && !quotaError ? (
            <span className="text-data text-muted-foreground">
              {quotaUsed}/{quotaLimit} used
            </span>
          ) : null}
        </div>

        {quota && !quotaError ? (
          <>
            <Progress
              value={quotaPercent}
              aria-label={`${quotaUsed} of ${quotaLimit} checks used`}
            />
            <p className="text-sm leading-6 text-muted-foreground text-pretty">
              {quotaNav.canUpload
                ? "Upload a resume to run your check against a job post."
                : quotaNav.exhaustedMessage}
            </p>
          </>
        ) : quotaError ? (
          <div className="app-inline-notice" role="alert">
            <p className="text-sm leading-6 text-muted-foreground">{quotaError}</p>
            <Button type="button" variant="outline" size="sm" onClick={onQuotaRetry}>
              <ReloadIcon aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        {quotaNav.canUpload ? (
          <Button type="button" className="w-full" onClick={onNewAnalysis} disabled={quotaNav.hasError}>
            <PlusIcon data-icon="inline-start" aria-hidden="true" />
            Upload resume
          </Button>
        ) : quotaNav.savedCheckPath ? (
          <Button asChild className="w-full">
            <Link href={quotaNav.savedCheckPath}>Open saved check</Link>
          </Button>
        ) : null}
        {!quotaNav.canUpload && quotaNav.canUseScratchBuilder ? (
          <Button type="button" variant="outline" className="w-full" onClick={onScratchBuilder}>
            <Pencil1Icon data-icon="inline-start" aria-hidden="true" />
            Build from scratch
          </Button>
        ) : null}
        <Button asChild variant="ghost" size="sm" className="w-full text-muted-foreground">
          <Link href="/account">Account settings</Link>
        </Button>
      </div>
    </aside>
  );
}
