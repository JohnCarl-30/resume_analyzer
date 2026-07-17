"use client";

import Link from "next/link";
import { ArchiveIcon, ChevronRightIcon, Pencil1Icon, PlusIcon, ReloadIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { ResumeStatusBadge } from "@/features/resumes/components/resume-status-badge";
import type { ResumeSummary } from "@/features/resumes/model/resume";
import { useResumeDashboard } from "@/features/resumes/view-models/use-resume-dashboard";
import type { AnalysisQuotaNavigationState } from "@/lib/analysis-quota-navigation";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recent";
  }
  return dateFormatter.format(date);
}

function scoreTone(score: number) {
  if (score >= 75) {
    return "text-foreground";
  }
  if (score >= 50) {
    return "text-muted-foreground";
  }
  return "text-destructive";
}

function rowLabel(resume: ResumeSummary) {
  const role = resume.targetRole || "Target role not set";
  return `Open ${resume.fileName}, ${resume.score}% match, ${role}, ${formatDate(resume.uploadedAt)}`;
}

function MetricChipSkeleton() {
  return (
    <div className="app-metric-chip" aria-hidden="true">
      <Skeleton className="app-skeleton h-3.5 w-14" />
      <Skeleton className="app-skeleton mt-2 h-6 w-8" />
    </div>
  );
}

function MetricChips({
  stats,
  isLoading,
}: {
  stats: { totalResumes: number; averageMatchRate: number; optimizedCount: number };
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="app-metric-row" aria-hidden="true">
        <MetricChipSkeleton />
        <MetricChipSkeleton />
        <MetricChipSkeleton />
      </div>
    );
  }

  return (
    <dl className="app-metric-row" aria-label="Saved check summary">
      <div className="app-metric-chip">
        <dt>Saved</dt>
        <dd>{stats.totalResumes}</dd>
      </div>
      <div className="app-metric-chip">
        <dt>Avg match</dt>
        <dd>{`${stats.averageMatchRate}%`}</dd>
      </div>
      <div className="app-metric-chip">
        <dt>Strong</dt>
        <dd>
          {stats.optimizedCount}
          <span className="app-metric-chip-note">75%+</span>
        </dd>
      </div>
    </dl>
  );
}

function SavedChecksSkeleton({ workbench }: { workbench: boolean }) {
  return (
    <div
      className={cn("app-checks-list", workbench && "app-checks-list-workbench")}
      aria-busy="true"
      aria-label="Loading saved checks"
    >
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="app-checks-row-skeleton">
          <div className="min-w-0 space-y-2">
            <Skeleton className="app-skeleton h-4 w-2/5 max-w-xs" />
            <Skeleton className="app-skeleton h-3 w-1/3 max-w-[10rem] md:hidden" />
          </div>
          <Skeleton className="app-skeleton hidden h-4 w-24 md:block" />
          <Skeleton className="app-skeleton hidden h-4 w-16 md:block" />
          <Skeleton className="app-skeleton h-4 w-10 shrink-0 justify-self-end" />
        </div>
      ))}
    </div>
  );
}

function IndexRow({
  resume,
  onOpenAnalysis,
  workbench,
}: {
  resume: ResumeSummary;
  onOpenAnalysis: (analysisId: string) => void;
  workbench: boolean;
}) {
  return (
    <button
      type="button"
      className={cn("app-checks-row group", workbench && "app-checks-row-workbench")}
      aria-label={rowLabel(resume)}
      onClick={() => onOpenAnalysis(resume.id)}
    >
      <div className="app-checks-cell-primary min-w-0">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate text-sm font-medium text-foreground">{resume.fileName}</span>
          <ResumeStatusBadge status={resume.status} />
        </div>
        <p className="mt-0.5 truncate text-caption text-muted-foreground md:hidden">
          {resume.targetRole || "Target role not set"}
          <span aria-hidden="true"> · </span>
          <span className="text-data">{formatDate(resume.uploadedAt)}</span>
        </p>
      </div>
      <span className="app-checks-cell-role hidden truncate text-sm text-muted-foreground md:block">
        {resume.targetRole || "—"}
      </span>
      <span className="app-checks-cell-date hidden text-data text-muted-foreground md:block">
        {formatDate(resume.uploadedAt)}
      </span>
      <span className="app-checks-cell-score flex items-center justify-end gap-2">
        <span className={cn("text-data font-semibold tabular-nums", scoreTone(resume.score))}>
          {resume.score}%
        </span>
        <ChevronRightIcon
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-[var(--motion-fast)] ease-[var(--ease-out-quart)] group-hover:translate-x-0.5 group-hover:text-foreground"
        />
      </span>
    </button>
  );
}

interface SavedChecksPanelProps {
  quotaNav: AnalysisQuotaNavigationState;
  onNewAnalysis: () => void;
  onScratchBuilder: () => void;
  onOpenAnalysis: (analysisId: string) => void;
  layout?: "default" | "workbench";
  className?: string;
}

function UploadActions({
  quotaNav,
  onNewAnalysis,
  onScratchBuilder,
  className,
}: {
  quotaNav: AnalysisQuotaNavigationState;
  onNewAnalysis: () => void;
  onScratchBuilder: () => void;
  className?: string;
}) {
  if (quotaNav.canUpload) {
    return (
      <Button type="button" className={className} onClick={onNewAnalysis} disabled={quotaNav.hasError}>
        <PlusIcon data-icon="inline-start" aria-hidden="true" />
        Upload resume
      </Button>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row", className)}>
      {quotaNav.savedCheckPath ? (
        <Button asChild className="w-full sm:w-auto">
          <Link href={quotaNav.savedCheckPath}>Open saved check</Link>
        </Button>
      ) : null}
      {quotaNav.canUseScratchBuilder ? (
        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onScratchBuilder}>
          <Pencil1Icon data-icon="inline-start" aria-hidden="true" />
          Build from scratch
        </Button>
      ) : null}
    </div>
  );
}

export function SavedChecksPanel({
  quotaNav,
  onNewAnalysis,
  onScratchBuilder,
  onOpenAnalysis,
  layout = "default",
  className,
}: SavedChecksPanelProps) {
  const { resumes, isLoading, error, stats, refetch } = useResumeDashboard();
  const workbench = layout === "workbench";

  return (
    <section
      className={cn(
        workbench ? "app-workbench-main min-w-0" : "app-index-panel min-w-0",
        className,
      )}
      aria-labelledby="home-saved-checks-heading"
    >
      <header
        className={cn(
          "flex flex-col gap-3",
          !workbench && "border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between",
          workbench && "sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <div className="min-w-0 space-y-1">
          <h2 id="home-saved-checks-heading" className="app-section-heading">
            Saved checks
          </h2>
          {!workbench ? (
            <p className="max-w-[65ch] text-sm leading-6 text-muted-foreground">
              Reopen a saved check to load stored metrics — no re-analysis required.
            </p>
          ) : null}
        </div>
        <UploadActions
          quotaNav={quotaNav}
          onNewAnalysis={onNewAnalysis}
          onScratchBuilder={onScratchBuilder}
          className="w-full shrink-0 sm:w-auto"
        />
      </header>

      <MetricChips stats={stats} isLoading={isLoading} />

      {error ? (
        <div className="app-inline-notice mt-4" role="alert">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-foreground">Saved checks unavailable</p>
            <p className="text-sm leading-6 text-muted-foreground">
              {error.includes("fetch") || error.includes("Failed")
                ? "We couldn't reach the API. Make sure the server is running, then try again."
                : error}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={refetch}>
            <ReloadIcon aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && resumes.length === 0 ? (
        <Empty className="mt-4 min-h-48 border border-dashed border-border bg-muted/15 px-6 py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ArchiveIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No saved checks yet</EmptyTitle>
            <EmptyDescription className="max-w-[42ch]">
              {quotaNav.canUpload
                ? "Upload a resume to run your first analysis. Results stay on the analysis page when processing finishes."
                : quotaNav.exhaustedMessage}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <UploadActions
              quotaNav={quotaNav}
              onNewAnalysis={onNewAnalysis}
              onScratchBuilder={onScratchBuilder}
              className="w-full sm:w-auto"
            />
          </EmptyContent>
        </Empty>
      ) : null}

      {isLoading ? (
        <SavedChecksSkeleton workbench={workbench} />
      ) : resumes.length > 0 ? (
        <div
          className={cn(
            "app-checks-list mt-4",
            workbench && "app-checks-list-workbench",
          )}
        >
          <div
            className="app-checks-head hidden md:grid"
            aria-hidden="true"
          >
            <span>Resume</span>
            <span>Role</span>
            <span>Date</span>
            <span className="text-right">Match</span>
          </div>
          {resumes.map((resume) => (
            <IndexRow
              key={resume.id}
              resume={resume}
              onOpenAnalysis={onOpenAnalysis}
              workbench={workbench}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
