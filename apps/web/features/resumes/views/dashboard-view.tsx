"use client";

import React from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Clock,
  FileText,
  Inbox,
  Plus,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ResumeStatusBadge } from "../components/resume-status-badge";
import type { ResumeSummary } from "../model/resume";
import { useResumeDashboard } from "../view-models/use-resume-dashboard";
import {
  GAP,
  PADDING,
  PADDING_Y,
  MARGIN_TOP,
  COMPONENT_SPACING,
} from "@/lib/design-tokens";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

interface DashboardViewProps {
  onNewAnalysis: () => void;
  onOpenAnalysis: (analysisId: string) => void;
  onViewAll: () => void;
}

function getScoreVariant(score: number): BadgeVariant {
  if (score >= 75) {
    return "default";
  }

  if (score >= 50) {
    return "secondary";
  }

  return "destructive";
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recent";
  }

  return dateFormatter.format(date);
}

function DashboardSkeleton() {
  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border bg-background md:block">
        <div className="border-b px-4 py-3">
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="flex flex-col gap-0">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="grid grid-cols-[1.4fr_1fr_0.8fr_0.8fr_auto] items-center gap-4 border-b px-4 py-4 last:border-b-0"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="size-9" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-8" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {[1, 2, 3].map((item) => (
          <div key={item} className="rounded-lg border bg-background p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="size-10" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function AnalysisMobileCard({
  resume,
  onOpenAnalysis,
}: {
  resume: ResumeSummary;
  onOpenAnalysis: (analysisId: string) => void;
}) {
  return (
    <article className={`rounded-lg border bg-background ${COMPONENT_SPACING.mobileCard.padding}`}>
      <div className={`flex items-start justify-between ${GAP.default}`}>
        <div className={`flex min-w-0 items-start ${GAP.compact}`}>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <FileText aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold">{resume.candidateName || "Untitled Analysis"}</h3>
            <p className="truncate text-sm text-muted-foreground">{resume.fileName}</p>
          </div>
        </div>
        <ResumeStatusBadge status={resume.status} />
      </div>
      <div className={`${MARGIN_TOP.section} flex flex-col ${GAP.default}`}>
        <div className={`flex items-center justify-between ${GAP.compact}`}>
          <p className="truncate text-sm text-muted-foreground">{resume.targetRole || "Target role not set"}</p>
          <Badge variant={getScoreVariant(resume.score)}>{resume.score}%</Badge>
        </div>
        <Progress value={resume.score} aria-label={`${resume.score}% match rate`} />
        <div className={`grid grid-cols-2 ${GAP.compact} text-sm`}>
          <div className={`flex flex-col ${GAP.tight}`}>
            <span className="text-muted-foreground">Words to add</span>
            <span className="font-medium">{resume.missingKeywordCount}</span>
          </div>
          <div className={`flex flex-col ${GAP.tight}`}>
            <span className="text-muted-foreground">Fixes</span>
            <span className="font-medium">{resume.suggestionCount}</span>
          </div>
        </div>
      </div>
      <div className={`${MARGIN_TOP.section} flex items-center justify-between ${GAP.compact} border-t ${PADDING_Y.default}`}>
        <div className={`flex min-w-0 items-center ${GAP.inline} text-sm text-muted-foreground`}>
          <Clock aria-hidden="true" />
          <span className="truncate">{formatDate(resume.uploadedAt)}</span>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => onOpenAnalysis(resume.id)}>
          Open
          <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}

export function DashboardView({ onNewAnalysis, onOpenAnalysis }: DashboardViewProps) {
  const { resumes, isLoading, error, stats } = useResumeDashboard();

  const displayStats = [
    {
      label: "Analyses",
      value: stats.totalResumes.toString(),
      description: "Saved sessions",
    },
    {
      label: "Average match",
      value: `${stats.averageMatchRate}%`,
      description: "Across resumes",
    },
    {
      label: "Strong matches",
      value: stats.optimizedCount.toString(),
      description: "75% or higher",
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className={`mx-auto flex w-full max-w-7xl flex-col ${GAP.section} px-4 py-6 sm:px-6 lg:px-8`}>
        <header className={`flex flex-col ${GAP.default} border-b pb-6 md:flex-row md:items-end md:justify-between`}>
          <div className={`flex max-w-2xl flex-col ${GAP.inline}`}>
            <h1 className="display-serif text-3xl sm:text-4xl">Saved resume checks</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Review match scores, missing job words, and next steps from one focused workspace.
            </p>
          </div>
          <Button type="button" onClick={onNewAnalysis}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            New resume check
          </Button>
        </header>

        <dl className="grid overflow-hidden rounded-lg border bg-background md:grid-cols-3">
          {displayStats.map((stat) => (
            <div key={stat.label} className={`border-b ${PADDING.default} last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0`}>
              <dt className="text-sm text-muted-foreground">{stat.label}</dt>
              <dd className={`${MARGIN_TOP.inline} flex items-baseline ${GAP.inline}`}>
                <span className="text-3xl font-semibold tracking-tight">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.description}</span>
              </dd>
            </div>
          ))}
        </dl>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Dashboard unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <section className={`flex flex-col ${GAP.compact}`}>
          <div className={`flex flex-col ${GAP.tight} sm:flex-row sm:items-end sm:justify-between`}>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Recent checks</h2>
              <p className="text-sm text-muted-foreground">
                Open a saved check to continue editing or print the resume.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{resumes.length} total</p>
          </div>

          {isLoading ? <DashboardSkeleton /> : null}

          {!isLoading && !error && resumes.length === 0 ? (
            <Empty className="min-h-72 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Inbox aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>No resume checks yet</EmptyTitle>
                <EmptyDescription>
                  Start by checking one resume against a job post. Your saved checks will appear here.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button type="button" onClick={onNewAnalysis}>
                  <Plus data-icon="inline-start" aria-hidden="true" />
                  New resume check
                </Button>
              </EmptyContent>
            </Empty>
          ) : null}

          {!isLoading && resumes.length > 0 ? (
            <>
              <div className="hidden overflow-hidden rounded-lg border bg-background md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Target role</TableHead>
                      <TableHead>Match</TableHead>
                      <TableHead>Gaps</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resumes.map((resume) => (
                      <TableRow key={resume.id}>
                        <TableCell>
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                              <FileText aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-medium">{resume.candidateName || "Untitled Analysis"}</p>
                              <p className="truncate text-muted-foreground">{resume.fileName}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-56 truncate">{resume.targetRole || "Target role not set"}</TableCell>
                        <TableCell>
                          <div className="flex min-w-32 items-center gap-3">
                            <Progress value={resume.score} aria-label={`${resume.score}% match rate`} />
                            <Badge variant={getScoreVariant(resume.score)}>{resume.score}%</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{resume.missingKeywordCount} to add</Badge>
                            <Badge variant="secondary">{resume.suggestionCount} fixes</Badge>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(resume.uploadedAt)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => onOpenAnalysis(resume.id)}
                            >
                              Open
                              <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className={`grid ${GAP.compact} md:hidden`}>
                {resumes.map((resume) => (
                  <AnalysisMobileCard key={resume.id} resume={resume} onOpenAnalysis={onOpenAnalysis} />
                ))}
              </div>
            </>
          ) : null}
        </section>
      </section>
    </main>
  );
}
