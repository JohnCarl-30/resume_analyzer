"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircledIcon } from "@radix-ui/react-icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AnalysisNextStepAction } from "../../view-models/analysis-next-steps";
import type { ReviewSuggestionItem } from "../../view-models/analysis-review-items";
import type { ResumeAnalysisResult } from "../../model/resume-analysis";

interface AnalysisSuggestionsReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisResult: ResumeAnalysisResult;
  resumeTitle: string;
  items: ReviewSuggestionItem[];
  preview: React.ReactNode;
  onApprove: (item: ReviewSuggestionItem) => void;
  onFinish: () => void;
}

function SeverityBadge({ severity }: { severity: ReviewSuggestionItem["severity"] }) {
  if (severity === "high") {
    return <Badge variant="destructive">Important</Badge>;
  }
  if (severity === "medium") {
    return <Badge variant="secondary">Helpful</Badge>;
  }
  if (severity === "low") {
    return <Badge variant="outline">Optional</Badge>;
  }
  return <Badge variant="outline">Suggested</Badge>;
}

export function AnalysisSuggestionsReviewModal({
  open,
  onOpenChange,
  analysisResult,
  resumeTitle,
  items,
  preview,
  onApprove,
  onFinish,
}: AnalysisSuggestionsReviewModalProps) {
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setResolvedIds([]);
    }
  }, [open]);

  const pendingItems = useMemo(
    () => items.filter((item) => !resolvedIds.includes(item.id)),
    [items, resolvedIds],
  );

  const criticalCount = analysisResult.suggestions.filter((item) => item.severity === "high").length;

  function resolveItem(item: ReviewSuggestionItem, approved: boolean) {
    if (approved) {
      onApprove(item);
    }
    setResolvedIds((current) => (current.includes(item.id) ? current : [...current, item.id]));
  }

  function handleFinish() {
    onFinish();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[92vh] max-w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-xl border border-[color:var(--page-line)] bg-white p-0 text-[color:var(--page-text)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:max-w-5xl"
      >
        <div className="border-b border-[color:var(--page-line)] px-5 py-4 sm:px-6">
          <DialogTitle className="text-xl font-semibold tracking-tight text-[color:var(--page-text)]">
            Review suggested improvements
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-6 text-[color:var(--page-muted)]">
            {resumeTitle} · {analysisResult.targetRole}. Approve changes you want added to the resume, or skip anything
            you do not want.
          </DialogDescription>
        </div>

        <div className="grid gap-4 border-b border-[color:var(--page-line)] px-5 py-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] sm:px-6">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg-strong)] p-3">
              <dt className="text-[0.68rem] font-medium uppercase tracking-wide text-[color:var(--page-muted)]">
                Match
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{Math.round(analysisResult.score)}%</dd>
            </div>
            <div className="rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg-strong)] p-3">
              <dt className="text-[0.68rem] font-medium uppercase tracking-wide text-[color:var(--page-muted)]">
                Found words
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {analysisResult.matchedKeywords.length}
              </dd>
            </div>
            <div className="rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg-strong)] p-3">
              <dt className="text-[0.68rem] font-medium uppercase tracking-wide text-[color:var(--page-muted)]">
                Words to add
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {analysisResult.missingKeywords.length}
              </dd>
            </div>
            <div className="rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg-strong)] p-3">
              <dt className="text-[0.68rem] font-medium uppercase tracking-wide text-[color:var(--page-muted)]">
                Important
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{criticalCount}</dd>
            </div>
          </dl>

          <div className="min-h-0 overflow-hidden rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg-strong)]">
            <div className="border-b border-[color:var(--page-line)] px-3 py-2 text-xs font-medium uppercase tracking-wide text-[color:var(--page-muted)]">
              Resume preview
            </div>
            <div className="max-h-56 overflow-auto p-3 sm:max-h-64">{preview}</div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {pendingItems.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[color:var(--page-line)] px-6 py-8 text-center">
              <CheckCircledIcon aria-hidden="true" className="size-8 text-[color:var(--brand)]" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-[color:var(--page-text)]">You&apos;re caught up</p>
                <p className="text-sm leading-6 text-[color:var(--page-muted)]">
                  Approved changes are in the editor. You can keep editing or print when ready.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {pendingItems.map((item) => (
                <article
                  key={item.id}
                  className="rounded-lg border border-[color:var(--page-line)] bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold tracking-tight text-[color:var(--page-text)]">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-[color:var(--page-muted)]">{item.description}</p>
                    </div>
                    <SeverityBadge severity={item.severity} />
                  </div>

                  {item.proposedChange ? (
                    <div className="mt-3 rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg-strong)] px-3 py-2">
                      <p className="text-[0.68rem] font-medium uppercase tracking-wide text-[color:var(--page-muted)]">
                        Suggested edit
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[color:var(--page-text)]">{item.proposedChange}</p>
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => resolveItem(item, false)}>
                      Skip
                    </Button>
                    <Button type="button" size="sm" onClick={() => resolveItem(item, true)}>
                      {item.kind === "editable" ? "Approve" : "Got it"}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-[color:var(--page-line)] px-5 py-4 sm:flex-row sm:justify-between sm:px-6">
          <Button type="button" variant="ghost" onClick={handleFinish}>
            Review later
          </Button>
          <Button type="button" onClick={handleFinish}>
            Continue to editor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { AnalysisNextStepAction };