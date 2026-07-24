import React from "react";
import { ArrowRightIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type { ResumeAnalysisResult, AnalysisSuggestion } from "../../editor/model/resume-analysis";

export interface StepSuggestionsProps {
  analysisResult: ResumeAnalysisResult;
  onEnterEditor: () => void;
  onBack: () => void;
}

function SeverityBadge({ severity }: { severity: AnalysisSuggestion["severity"] }) {
  if (severity === "high") {
    return <Badge variant="destructive">Important</Badge>;
  }
  if (severity === "medium") {
    return <Badge variant="secondary">Helpful</Badge>;
  }
  return <Badge variant="outline">Optional</Badge>;
}

function SuggestionCard({ suggestion }: { suggestion: AnalysisSuggestion }) {
  const categoryLabel: Record<AnalysisSuggestion["category"], string> = {
    keywords: "Job words",
    writing: "Clarity",
    impact: "Impact",
  };

  return (
    <article role="article" className="rounded-lg border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 data-testid="suggestion-title" className="text-base font-semibold tracking-tight text-foreground">
            {suggestion.title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{categoryLabel[suggestion.category]}</p>
        </div>
        <SeverityBadge severity={suggestion.severity} />
      </div>
      <p data-testid="suggestion-detail" className="mt-4 text-sm leading-7 text-muted-foreground">
        {suggestion.detail}
      </p>
    </article>
  );
}

export function StepSuggestions({ analysisResult, onEnterEditor, onBack }: StepSuggestionsProps) {
  const { suggestions, matchedKeywords, missingKeywords } = analysisResult;
  const totalCount = suggestions.length;
  const criticalCount = suggestions.filter((s) => s.severity === "high").length;
  const scannerReady = !suggestions.some((suggestion) =>
    ["parse-thin-extract", "parse-missing-email", "parse-missing-phone", "ats-standard-headings"].includes(
      suggestion.id,
    ),
  ) && (analysisResult.extractedCharacterCount ?? 500) >= 400;
  const topSuggestions = [...suggestions].sort((a, b) => {
    const severityRank: Record<AnalysisSuggestion["severity"], number> = {
      high: 0,
      medium: 1,
      low: 2,
    };
    return severityRank[a.severity] - severityRank[b.severity];
  });
  const visibleSuggestions = topSuggestions.slice(0, 3);
  const hiddenSuggestionCount = Math.max(topSuggestions.length - visibleSuggestions.length, 0);
  const readiness = [
    {
      label: matchedKeywords.length > 0 ? `${matchedKeywords.length} job words found` : "Add job words from the description",
      complete: matchedKeywords.length > 0,
    },
    {
      label: missingKeywords.length === 0 ? "No missing job words flagged" : `${missingKeywords.length} job words still missing`,
      complete: missingKeywords.length === 0,
    },
    {
      label: criticalCount === 0 ? "No urgent fixes" : `${criticalCount} important improvement${criticalCount === 1 ? "" : "s"} to fix`,
      complete: criticalCount === 0,
    },
    {
      label: scannerReady
        ? "Looks readable for text scanners"
        : "Improve contact details or file readability",
      complete: scannerReady,
    },
  ];

  return (
    <section className="section-reveal flex flex-1 flex-col overflow-y-auto bg-background px-4 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-3 text-left sm:items-center sm:text-center">
          <span className="sr-only">STEP 5 OF 5</span>
          <h1 className="display-serif text-3xl text-foreground sm:text-5xl">
            Fix these first
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            These are the clearest changes to help your resume match this job. You can add a draft suggestion, edit it,
            and print only when it feels right.
          </p>
        </div>

        <div className="rounded-lg border bg-background p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Resume check</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Suggestions are based on the {analysisResult.targetRole} job and the job post you pasted.
                The editor keeps familiar sections and readable text so the final PDF stays easy to read.
              </p>
            </div>
            <div className="grid gap-2 sm:min-w-72">
              {readiness.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircledIcon
                    aria-hidden="true"
                    className={item.complete ? "text-primary" : "text-muted-foreground"}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <dl
          data-testid="suggestion-summary"
          className="grid grid-cols-2 overflow-hidden rounded-lg border bg-background md:grid-cols-4"
        >
          <div
            data-testid="summary-suggestions"
            className="border-b p-4 even:border-l md:border-b-0 md:border-l md:first:border-l-0"
          >
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Top fixes</dt>
            <dd className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{totalCount}</dd>
          </div>
          <div
            data-testid="summary-important"
            className="border-b p-4 even:border-l md:border-b-0 md:border-l md:first:border-l-0"
          >
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Important</dt>
            <dd className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{criticalCount}</dd>
          </div>
          <div
            data-testid="summary-found"
            className="border-b p-4 even:border-l md:border-b-0 md:border-l md:first:border-l-0"
          >
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Found words</dt>
            <dd className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{matchedKeywords.length}</dd>
          </div>
          <div
            data-testid="summary-missing"
            className="border-b p-4 even:border-l md:border-b-0 md:border-l md:first:border-l-0"
          >
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Words to add</dt>
            <dd className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{missingKeywords.length}</dd>
          </div>
        </dl>

        <div className="flex-1 overflow-y-auto">
          {suggestions.length === 0 ? (
            <Empty className="min-h-64 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CheckCircledIcon aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>No suggestions</EmptyTitle>
                <EmptyDescription>
                  No suggestions — your resume already looks well matched to this job.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-3">
              {visibleSuggestions.map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))}
              {hiddenSuggestionCount > 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  {hiddenSuggestionCount} more suggestion{hiddenSuggestionCount === 1 ? "" : "s"} will be waiting in the editor.
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto mt-6 flex w-full max-w-5xl flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="button" onClick={onEnterEditor}>
            Open editor
            <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
          </Button>
      </div>
    </section>
  );
}
