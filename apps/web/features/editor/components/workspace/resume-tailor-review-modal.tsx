"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircledIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ResumeAnalysisResult } from "../../model/resume-analysis";
import type { TailorProposal } from "../../model/resume-tailor-draft";

interface ResumeTailorReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisResult: ResumeAnalysisResult;
  resumeTitle: string;
  proposals: TailorProposal[];
  isLoading: boolean;
  error: string;
  preview: React.ReactNode;
  onApprove: (proposal: TailorProposal) => void;
  onFinish: () => void;
}

function ChangeBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg-strong)] px-3 py-2">
      <p className="text-[0.68rem] font-medium uppercase tracking-wide text-[color:var(--page-muted)]">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[color:var(--page-text)]">{value}</p>
    </div>
  );
}

export function ResumeTailorReviewModal({
  open,
  onOpenChange,
  analysisResult,
  resumeTitle,
  proposals,
  isLoading,
  error,
  preview,
  onApprove,
  onFinish,
}: ResumeTailorReviewModalProps) {
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setResolvedIds([]);
    }
  }, [open, proposals]);

  const pendingItems = useMemo(
    () => proposals.filter((item) => !resolvedIds.includes(item.id)),
    [proposals, resolvedIds],
  );

  function resolveItem(proposal: TailorProposal, approved: boolean) {
    if (approved) {
      onApprove(proposal);
    }
    setResolvedIds((current) =>
      current.includes(proposal.id) ? current : [...current, proposal.id],
    );
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
            Review job-tailored edits
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm leading-6 text-[color:var(--page-muted)]">
            {resumeTitle} · {analysisResult.targetRole}. Approve the edits you want in your resume layout, or skip
            anything you want to keep as-is.
          </DialogDescription>
        </div>

        <div className="grid gap-4 border-b border-[color:var(--page-line)] px-5 py-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] sm:px-6">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg-strong)] p-3">
              <dt className="text-[0.68rem] font-medium uppercase tracking-wide text-[color:var(--page-muted)]">
                Match
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{Math.round(analysisResult.score)}%</dd>
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
                Suggestions
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">{proposals.length}</dd>
            </div>
          </dl>

          <div className="min-h-0 overflow-hidden rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg-strong)]">
            <div className="border-b border-[color:var(--page-line)] px-3 py-2 text-xs font-medium uppercase tracking-wide text-[color:var(--page-muted)]">
              Layout preview
            </div>
            <div className="max-h-56 overflow-auto p-3 sm:max-h-64">{preview}</div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {isLoading ? (
            <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-[color:var(--page-line)] px-6 py-8 text-sm text-[color:var(--page-muted)]">
              Preparing job-tailored edits…
            </div>
          ) : error ? (
            <div className="rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg-strong)] px-4 py-3 text-sm leading-6 text-[color:var(--page-muted)]">
              {error}
            </div>
          ) : pendingItems.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-[color:var(--page-line)] px-6 py-8 text-center">
              <CheckCircledIcon aria-hidden="true" className="size-8 text-[color:var(--brand)]" />
              <div className="space-y-1">
                <p className="text-base font-semibold text-[color:var(--page-text)]">Ready to continue</p>
                <p className="text-sm leading-6 text-[color:var(--page-muted)]">
                  Approved edits are reflected in the layout preview.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {pendingItems.map((proposal) => (
                <article
                  key={proposal.id}
                  className="rounded-lg border border-[color:var(--page-line)] bg-white p-4"
                >
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold tracking-tight text-[color:var(--page-text)]">
                      {proposal.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-[color:var(--page-muted)]">{proposal.description}</p>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <ChangeBlock label="Before" value={proposal.before} />
                    <ChangeBlock label="After" value={proposal.after} />
                  </div>

                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => resolveItem(proposal, false)}>
                      Skip
                    </Button>
                    <Button type="button" size="sm" onClick={() => resolveItem(proposal, true)}>
                      Approve
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-[color:var(--page-line)] px-5 py-4 sm:flex-row sm:justify-between sm:px-6">
          <Button type="button" variant="ghost" onClick={handleFinish} disabled={isLoading}>
            Review later
          </Button>
          <Button type="button" onClick={handleFinish} disabled={isLoading}>
            Continue to editor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
