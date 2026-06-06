import React from "react";
import { ArrowRight, CheckCircle2, FileText, Lightbulb, SearchCheck, Target, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
  const Icon = suggestion.severity === "high" ? TriangleAlert : suggestion.severity === "medium" ? Target : Lightbulb;

  return (
    <Card role="article">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <Icon aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold tracking-tight text-foreground">{suggestion.title}</h3>
              <span className="text-sm text-muted-foreground">{suggestion.category}</span>
            </div>
          </div>
          <SeverityBadge severity={suggestion.severity} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-7 text-muted-foreground">{suggestion.detail}</p>
      </CardContent>
    </Card>
  );
}

export function StepSuggestions({ analysisResult, onEnterEditor, onBack }: StepSuggestionsProps) {
  const { suggestions, matchedKeywords, missingKeywords } = analysisResult;
  const totalCount = suggestions.length;
  const criticalCount = suggestions.filter((s) => s.severity === "high").length;
  const atsReadiness = [
    {
      label: matchedKeywords.length > 0 ? `${matchedKeywords.length} job keywords found` : "Add job keywords from the description",
      complete: matchedKeywords.length > 0,
    },
    {
      label: missingKeywords.length === 0 ? "No missing keywords flagged" : `${missingKeywords.length} keywords still missing`,
      complete: missingKeywords.length === 0,
    },
    {
      label: criticalCount === 0 ? "No urgent scanner issues" : `${criticalCount} important improvement${criticalCount === 1 ? "" : "s"} to fix`,
      complete: criticalCount === 0,
    },
  ];

  const summaryItems = [
    { label: "Suggestions", value: totalCount, icon: FileText },
    { label: "Important", value: criticalCount, icon: TriangleAlert },
    { label: "Found", value: matchedKeywords.length, icon: CheckCircle2 },
    { label: "Missing", value: missingKeywords.length, icon: Target },
  ];

  return (
    <section className="section-reveal flex flex-1 flex-col bg-background px-4 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6">
        <div className="flex flex-col gap-3 text-left sm:items-center sm:text-center">
          <Badge variant="secondary">STEP 5 OF 5</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Your resume improvement plan
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            These are the changes that can help your resume match this job and pass company resume scanners.
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <SearchCheck aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">Job match and scanner check</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Suggestions are based on the {analysisResult.targetRole} job and the job post you pasted.
                  The editor keeps familiar sections and readable text so the final PDF stays easy to scan.
                </p>
              </div>
            </div>
            <div className="grid gap-2 sm:min-w-72">
              {atsReadiness.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2
                    aria-hidden="true"
                    className={item.complete ? "text-primary" : "text-muted-foreground"}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {summaryItems.map((item) => (
            <Card key={item.label}>
              <CardContent className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-3xl font-semibold tracking-tight text-foreground">{item.value}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p>
                </div>
                <div className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <item.icon aria-hidden="true" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {suggestions.length === 0 ? (
            <Empty className="min-h-64 border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <CheckCircle2 aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>No suggestions</EmptyTitle>
                <EmptyDescription>
                  No suggestions — your resume already looks well-matched to this job.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-3">
              {suggestions.map((suggestion) => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Card className="mx-auto mt-6 w-full max-w-5xl">
        <CardFooter className="flex-col gap-3 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button type="button" onClick={onEnterEditor}>
            Open Resume Editor
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </CardFooter>
      </Card>
    </section>
  );
}
