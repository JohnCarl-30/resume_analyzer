"use client";

import React from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Briefcase,
  Clock,
  FileText,
  Gauge,
  Inbox,
  Plus,
  Sparkles,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
      <Card className="hidden md:flex">
        <CardHeader>
          <CardTitle>Recent analyses</CardTitle>
          <CardDescription>Loading saved resume analysis sessions.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="grid grid-cols-[1.4fr_1fr_0.8fr_0.8fr_auto] items-center gap-4">
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
        </CardContent>
      </Card>

      <div className="grid gap-3 md:hidden">
        {[1, 2, 3].map((item) => (
          <Card key={item}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <Skeleton className="size-10" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Skeleton className="h-2 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
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
    <Card>
      <CardHeader>
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <FileText aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate">{resume.candidateName || "Untitled Analysis"}</CardTitle>
            <CardDescription className="truncate">{resume.fileName}</CardDescription>
          </div>
        </div>
        <CardAction>
          <ResumeStatusBadge status={resume.status} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm text-muted-foreground">{resume.targetRole || "Target role not set"}</p>
          <Badge variant={getScoreVariant(resume.score)}>{resume.score}%</Badge>
        </div>
        <Progress value={resume.score} aria-label={`${resume.score}% match rate`} />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Missing keywords</span>
            <span className="font-medium">{resume.missingKeywordCount}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Suggestions</span>
            <span className="font-medium">{resume.suggestionCount}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
          <Clock aria-hidden="true" />
          <span className="truncate">{formatDate(resume.uploadedAt)}</span>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => onOpenAnalysis(resume.id)}>
          Open
          <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export function DashboardView({ onNewAnalysis, onOpenAnalysis, onViewAll }: DashboardViewProps) {
  const { resumes, isLoading, error, stats } = useResumeDashboard();

  const displayStats = [
    {
      label: "Analyses",
      value: stats.totalResumes.toString(),
      description: "Saved comparison sessions",
      icon: Briefcase,
    },
    {
      label: "Average match",
      value: `${stats.averageMatchRate}%`,
      description: "Across all saved resumes",
      icon: Gauge,
    },
    {
      label: "Strong matches",
      value: stats.optimizedCount.toString(),
      description: "Scores at 75% or higher",
      icon: Sparkles,
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-2xl flex-col gap-2">
            <Badge variant="outline">Resume analysis dashboard</Badge>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Saved analysis sessions</h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Review match scores, resume gaps, and recent optimization work from one focused workspace.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" variant="outline" onClick={onViewAll}>
              View all
            </Button>
            <Button type="button" onClick={onNewAnalysis}>
              <Plus data-icon="inline-start" aria-hidden="true" />
              New Analysis
            </Button>
          </div>
        </header>

        <div className="grid gap-3 md:grid-cols-3">
          {displayStats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader>
                <CardTitle>{stat.label}</CardTitle>
                <CardDescription>{stat.description}</CardDescription>
                <CardAction>
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <stat.icon aria-hidden="true" />
                  </div>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Dashboard unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Recent analyses</h2>
              <p className="text-sm text-muted-foreground">
                Open an existing analysis to continue editing or export the resume.
              </p>
            </div>
            <Badge variant="secondary">{resumes.length} total</Badge>
          </div>

          {isLoading ? <DashboardSkeleton /> : null}

          {!isLoading && !error && resumes.length === 0 ? (
            <Empty className="min-h-72 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Inbox aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>No analyses yet</EmptyTitle>
                <EmptyDescription>
                  Start a resume analysis to see saved sessions, match scores, and keyword gaps here.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button type="button" onClick={onNewAnalysis}>
                  <Plus data-icon="inline-start" aria-hidden="true" />
                  New Analysis
                </Button>
              </EmptyContent>
            </Empty>
          ) : null}

          {!isLoading && resumes.length > 0 ? (
            <>
              <Card className="hidden md:flex">
                <CardContent className="p-0">
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
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
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
                              <Badge variant="outline">{resume.missingKeywordCount} missing</Badge>
                              <Badge variant="secondary">{resume.suggestionCount} suggestions</Badge>
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
                </CardContent>
                <Separator />
                <CardFooter className="justify-between gap-3">
                  <p className="text-sm text-muted-foreground">Status reflects the latest saved analysis result.</p>
                  <ResumeStatusBadge status="analyzed" />
                </CardFooter>
              </Card>

              <div className="grid gap-3 md:hidden">
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
