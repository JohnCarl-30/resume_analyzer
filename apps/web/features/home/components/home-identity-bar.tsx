"use client";

import Link from "next/link";
import { Pencil1Icon, PlusIcon, ReloadIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import type { AnalysisQuota } from "@/lib/account-api";
import type { AnalysisQuotaNavigationState } from "@/lib/analysis-quota-navigation";
import { cn } from "@/lib/utils";

import {
  getHomeMastheadEyebrow,
  getHomeMastheadHeadline,
} from "../lib/home-display";
import { HomeIdentitySkeleton } from "./home-identity-skeleton";

interface HomeIdentityBarProps {
  quota: AnalysisQuota | null;
  quotaNav: AnalysisQuotaNavigationState;
  quotaError: string;
  isProfileLoaded: boolean;
  displayName: string;
  email?: string;
  initials: string;
  onNewAnalysis: () => void;
  onScratchBuilder: () => void;
  onQuotaRetry: () => void;
  className?: string;
}

export function HomeIdentityBar({
  quota,
  quotaNav,
  quotaError,
  isProfileLoaded,
  displayName,
  email,
  initials,
  onNewAnalysis,
  onScratchBuilder,
  onQuotaRetry,
  className,
}: HomeIdentityBarProps) {
  const quotaLoading = quotaNav.isLoading;
  const isBootstrapping = !isProfileLoaded || (quotaLoading && !quota && !quotaError);

  if (isBootstrapping) {
    return <HomeIdentitySkeleton className={className} />;
  }

  const quotaUsed = quota?.used ?? 0;
  const quotaLimit = quota?.limit ?? 1;

  const planLabel = quotaError
    ? "Plan unavailable"
    : quotaNav.canUpload
      ? "Check ready"
      : "Check used";

  const eyebrow = getHomeMastheadEyebrow(quotaError, quotaNav.canUpload);
  const headline = getHomeMastheadHeadline(quotaError, quotaNav.canUpload);

  const supportingCopy = quotaError
    ? null
    : quotaNav.canUpload
      ? "Match a resume to a job post. Results stay on the analysis page."
      : quotaNav.exhaustedMessage;

  return (
    <header className={cn("app-home-masthead-block", className)} aria-label="Your workspace">
      <div className="app-home-masthead">
        <div className="app-home-hero min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="app-home-eyebrow">{eyebrow}</span>
            <span
              className="app-home-avatar-chip"
              aria-label={`Signed in as ${displayName}`}
              title={displayName}
            >
              <span aria-hidden="true">{initials}</span>
            </span>
          </div>

          <h1 className="app-home-masthead-title mt-2 text-2xl text-foreground sm:text-[1.75rem]">
            {headline}
          </h1>

          {supportingCopy ? (
            <p className="mt-2 max-w-[48ch] text-sm leading-6 text-muted-foreground text-pretty">
              {supportingCopy}
            </p>
          ) : null}

          {email ? (
            <p className="mt-2 truncate text-caption text-muted-foreground">{email}</p>
          ) : null}
        </div>

        <div className="app-home-actions flex w-full flex-col gap-2 sm:w-auto sm:min-w-[12rem]">
          {quotaNav.canUpload ? (
            <Button
              type="button"
              className="w-full"
              onClick={onNewAnalysis}
              disabled={quotaNav.hasError}
            >
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
          <Link href="/account" className="app-home-account-link min-h-11 self-center sm:self-end">
            Account settings
          </Link>
        </div>
      </div>

      <div className="app-home-quota-strip">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
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
              {quotaUsed}/{quotaLimit} checks used
            </span>
          ) : null}
        </div>

        {quotaError ? (
          <div className="app-inline-notice mt-3" role="alert">
            <p className="text-sm leading-6 text-muted-foreground">{quotaError}</p>
            <Button type="button" variant="outline" size="sm" onClick={onQuotaRetry}>
              <ReloadIcon aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
