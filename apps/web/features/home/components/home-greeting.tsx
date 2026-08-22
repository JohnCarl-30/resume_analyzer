import { ReloadIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import type { AnalysisQuota } from "@/lib/account-api";
import type { AnalysisQuotaNavigationState } from "@/lib/analysis-quota-navigation";
import { cn } from "@/lib/utils";

import { getFirstName } from "../lib/home-display";
import { HomeIdentitySkeleton } from "./home-identity-skeleton";

interface HomeGreetingProps {
  quota: AnalysisQuota | null;
  quotaNav: AnalysisQuotaNavigationState;
  quotaError: string;
  isProfileLoaded: boolean;
  displayName: string;
  email?: string;
  initials: string;
  onQuotaRetry: () => void;
  className?: string;
}

/**
 * Identity and quota only. The things a signed-in person came to do live in
 * HomeActionTiles, so this stays a short greeting rather than competing with
 * them for attention.
 */
export function HomeGreeting({
  quota,
  quotaNav,
  quotaError,
  isProfileLoaded,
  displayName,
  email,
  initials,
  onQuotaRetry,
  className,
}: HomeGreetingProps) {
  if (!isProfileLoaded) {
    return <HomeIdentitySkeleton className={className} />;
  }

  const planLabel = quotaError
    ? "Plan unavailable"
    : quotaNav.canUpload
      ? "Check ready"
      : "Check used";

  return (
    <header className={cn("app-home-masthead-block", className)} aria-label="Your workspace">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="app-home-masthead-title text-2xl text-foreground sm:text-[1.75rem]">
            Welcome back, {getFirstName(displayName)}
          </h1>
          {email ? (
            <p className="mt-1 truncate text-caption text-muted-foreground">{email}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
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
              {quota.used ?? 0}/{quota.limit ?? 1} checks used
            </span>
          ) : null}
          <span
            className="app-home-avatar-chip"
            aria-label={`Signed in as ${displayName}`}
            title={displayName}
          >
            <span aria-hidden="true">{initials}</span>
          </span>
        </div>
      </div>

      {quotaError ? (
        <div className="app-inline-notice mt-4" role="alert">
          <p className="text-sm leading-6 text-muted-foreground">{quotaError}</p>
          <Button type="button" variant="outline" size="sm" onClick={onQuotaRetry}>
            <ReloadIcon aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : null}
    </header>
  );
}
