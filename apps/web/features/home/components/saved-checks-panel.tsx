"use client";

import Link from "next/link";
import { ArchiveIcon, ChevronRightIcon, Pencil1Icon, ReloadIcon } from "@radix-ui/react-icons";

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
import type { AnalysisQuotaNavigationState } from "@/lib/analysis-quota-navigation";
import { cn } from "@/lib/utils";

import {
  formatSavedCheckDate,
  savedCheckRowLabel,
  scoreToneClass,
} from "../lib/home-display";

function SavedChecksSkeleton() {
  return (
    <div className="app-checks-list" aria-busy="true" aria-label="Loading saved checks">
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
}: {
  resume: ResumeSummary;
  onOpenAnalysis: (analysisId: string) => void;
}) {
  return (
    <button
      type="button"
      className="app-checks-row group"
      aria-label={savedCheckRowLabel(resume)}
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
          <span className="text-data">{formatSavedCheckDate(resume.uploadedAt)}</span>
        </p>
      </div>
      <span className="app-checks-cell-role hidden truncate text-sm text-muted-foreground md:block">
        {resume.targetRole || "—"}
      </span>
      <span className="app-checks-cell-date hidden text-data text-muted-foreground md:block">
        {formatSavedCheckDate(resume.uploadedAt)}
      </span>
      <span className="app-checks-cell-score flex items-center justify-end gap-2">
        <span className={cn("app-checks-score-stamp", scoreToneClass(resume.score))}>
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
  resumes: ResumeSummary[];
  isLoading: boolean;
  error: string;
  onNewAnalysis: () => void;
  onScratchBuilder: () => void;
  onOpenAnalysis: (analysisId: string) => void;
  onRefetch: () => void;
  layout?: "default" | "workbench";
  className?: string;
}

function EmptyActions({
  quotaNav,
  onScratchBuilder,
}: {
  quotaNav: AnalysisQuotaNavigationState;
  onScratchBuilder: () => void;
}) {
  if (quotaNav.canUpload) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      {quotaNav.savedCheckPath ? (
        <Button asChild>
          <Link href={quotaNav.savedCheckPath}>Open saved check</Link>
        </Button>
      ) : null}
      {quotaNav.canUseScratchBuilder ? (
        <Button type="button" variant="outline" onClick={onScratchBuilder}>
          <Pencil1Icon data-icon="inline-start" aria-hidden="true" />
          Build from scratch
        </Button>
      ) : null}
    </div>
  );
}

export function SavedChecksPanel({
  quotaNav,
  resumes,
  isLoading,
  error,
  onNewAnalysis,
  onScratchBuilder,
  onOpenAnalysis,
  onRefetch,
  layout = "default",
  className,
}: SavedChecksPanelProps) {
  return (
    <section
      className={cn("app-home-checks min-w-0", className)}
      aria-labelledby="home-saved-checks-heading"
    >
      <header className="mb-4 space-y-1">
        <h2 id="home-saved-checks-heading" className="app-section-heading">
          Saved checks
        </h2>
        <p className="max-w-[55ch] text-sm leading-6 text-muted-foreground text-pretty">
          Reopen a check to review scores and notes — no re-analysis required.
        </p>
      </header>

      {error ? (
        <div className="app-inline-notice" role="alert">
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-foreground">Saved checks unavailable</p>
            <p className="text-sm leading-6 text-muted-foreground">
              {error.includes("fetch") || error.includes("Failed")
                ? "We couldn't reach the API. Check your connection, then try again."
                : error}
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onRefetch}>
            <ReloadIcon aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : null}

      {!isLoading && !error && resumes.length === 0 ? (
        <Empty className="min-h-44 border border-dashed border-border bg-muted/15 px-6 py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ArchiveIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Run your first check</EmptyTitle>
            <EmptyDescription className="max-w-[42ch]">
              {quotaNav.canUpload
                ? "Upload a resume and a job post. When analysis finishes, it shows up here so you can reopen it anytime."
                : quotaNav.exhaustedMessage}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <EmptyActions quotaNav={quotaNav} onScratchBuilder={onScratchBuilder} />
          </EmptyContent>
        </Empty>
      ) : null}

      {isLoading ? (
        <SavedChecksSkeleton />
      ) : resumes.length > 0 ? (
        <div className="app-checks-list">
          <div className="app-checks-head hidden md:grid" aria-hidden="true">
            <span>Resume</span>
            <span>Role</span>
            <span>Date</span>
            <span className="text-right">Match</span>
          </div>
          {resumes.map((resume) => (
            <IndexRow key={resume.id} resume={resume} onOpenAnalysis={onOpenAnalysis} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
