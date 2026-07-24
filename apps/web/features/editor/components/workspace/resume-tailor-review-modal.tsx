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
import { skillDiff, splitSkills } from "../../lib/skill-diff";
import type { ResumeAnalysisResult } from "../../model/resume-analysis";
import type { ResumeForm } from "../../model/resume-form";
import type { TailorProposal } from "../../model/resume-tailor-draft";
import type { ResumeTemplateVariant } from "../../../templates/model/template";
import { TailorLayoutPreview } from "./tailor-layout-preview";

function previewFormWithProposal(form: ResumeForm, proposal: TailorProposal | null): ResumeForm {
  if (!proposal) return form;

  const next = structuredClone(form);
  if (proposal.type === "summary") {
    next.personalInfo.summary = proposal.after;
    return next;
  }
  if (proposal.type === "skills") {
    next.personalInfo.skills = proposal.after;
    return next;
  }
  if (proposal.type === "experience" && proposal.experienceId) {
    const entry = next.experience.find((item) => item.id === proposal.experienceId);
    if (entry) {
      entry.bullets = proposal.after.split("\n").filter(Boolean);
    }
  }
  return next;
}

function normalizeSkillKey(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function joinSkills(skills: string[]) {
  return skills.join(", ");
}

interface ResumeTailorReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analysisResult: ResumeAnalysisResult;
  resumeTitle: string;
  proposals: TailorProposal[];
  isLoading: boolean;
  error: string;
  previewForm: ResumeForm;
  previewVariantId: ResumeTemplateVariant;
  onApprove: (proposal: TailorProposal) => void;
  onFinish: () => void;
}

function SkillsProposalDiff({
  before,
  proposedAfter,
  selectedSkills,
  onToggleSkill,
}: {
  before: string;
  proposedAfter: string;
  selectedSkills: string[];
  onToggleSkill: (skill: string) => void;
}) {
  const { added, removed, kept } = skillDiff(before, proposedAfter);
  const selectedKeys = new Set(selectedSkills.map(normalizeSkillKey));
  const suggestedSkills = [...kept, ...added];

  return (
    <div className="space-y-8 border-t border-[color:var(--page-line)] pt-8">
      {added.length > 0 ? (
        <div>
          <p className="text-[0.7rem] font-medium tracking-[0.04em] text-[color:var(--page-muted)]">
            Words to add
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {added.map((skill) => {
              const isSelected = selectedKeys.has(normalizeSkillKey(skill));
              return (
                <li key={`add-${skill}`}>
                  <button
                    type="button"
                    onClick={() => onToggleSkill(skill)}
                    aria-pressed={isSelected}
                    className={
                      isSelected
                        ? "rounded-md bg-[#EDF3EC] px-2.5 py-1 text-sm text-[#346538] transition-opacity hover:opacity-80"
                        : "rounded-md bg-[color:var(--page-bg)] px-2.5 py-1 text-sm text-[color:var(--page-muted)] line-through opacity-70 transition-opacity hover:opacity-90"
                    }
                  >
                    {skill}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {removed.length > 0 ? (
        <div>
          <p className="text-[0.7rem] font-medium tracking-[0.04em] text-[color:var(--page-muted)]">
            Words removed
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {removed.map((skill) => (
              <li
                key={`remove-${skill}`}
                className="rounded-md bg-[#FDEBEC] px-2.5 py-1 text-sm text-[#9F2F2D] line-through"
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <p className="text-[0.7rem] font-medium tracking-[0.04em] text-[color:var(--page-muted)]">
          Updated skills list
        </p>
        <p className="mt-1 text-xs leading-5 text-[color:var(--page-muted)]">
          Tap a skill to keep or drop it before you approve.
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {suggestedSkills.map((skill) => {
            const isSelected = selectedKeys.has(normalizeSkillKey(skill));
            const isAdded = added.some(
              (item) => normalizeSkillKey(item) === normalizeSkillKey(skill),
            );

            return (
              <li key={`skill-${skill}`}>
                <button
                  type="button"
                  onClick={() => onToggleSkill(skill)}
                  aria-pressed={isSelected}
                  className={
                    isSelected
                      ? isAdded
                        ? "rounded-md border border-[#cfe0cd] bg-[#EDF3EC] px-2.5 py-1 text-sm font-medium text-[#346538]"
                        : "rounded-md border border-[color:var(--page-line)] bg-white px-2.5 py-1 text-sm text-[color:var(--page-text)]"
                      : "rounded-md border border-dashed border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-2.5 py-1 text-sm text-[color:var(--page-muted)] line-through opacity-70"
                  }
                >
                  {skill}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function ProseProposalDiff({ before, after }: { before: string; after: string }) {
  return (
    <div className="grid gap-8 border-t border-[color:var(--page-line)] pt-8 sm:grid-cols-2 sm:gap-10">
      <div className="min-w-0">
        <p className="text-[0.7rem] font-medium tracking-[0.04em] text-[color:var(--page-muted)]">
          Current
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[color:var(--page-muted)]">
          {before}
        </p>
      </div>
      <div className="min-w-0">
        <p className="text-[0.7rem] font-medium tracking-[0.04em] text-[color:var(--page-muted)]">
          Suggested
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[color:var(--page-text)]">
          {after}
        </p>
      </div>
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
  previewForm,
  previewVariantId,
  onApprove,
  onFinish,
}: ResumeTailorReviewModalProps) {
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setResolvedIds([]);
    }
  }, [open, proposals]);

  const pendingItems = useMemo(
    () => proposals.filter((item) => !resolvedIds.includes(item.id)),
    [proposals, resolvedIds],
  );

  const totalCount = proposals.length;
  const completedCount = resolvedIds.length;
  const current = pendingItems[0] ?? null;
  const progressPercent =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const currentOrdinal = Math.min(completedCount + 1, Math.max(totalCount, 1));

  useEffect(() => {
    if (current?.type === "skills") {
      setSelectedSkills(splitSkills(current.after));
      return;
    }
    setSelectedSkills([]);
  }, [current]);

  const activeProposal = useMemo(() => {
    if (!current) {
      return null;
    }
    if (current.type !== "skills") {
      return current;
    }
    return {
      ...current,
      after: joinSkills(selectedSkills),
    };
  }, [current, selectedSkills]);

  const skillsAddedCount =
    activeProposal?.type === "skills"
      ? skillDiff(activeProposal.before, activeProposal.after).added.length
      : 0;
  const focusSection = activeProposal?.type ?? null;
  const livePreviewForm = useMemo(
    () => previewFormWithProposal(previewForm, activeProposal),
    [previewForm, activeProposal],
  );

  function toggleSkill(skill: string) {
    const key = normalizeSkillKey(skill);
    setSelectedSkills((currentSkills) => {
      const exists = currentSkills.some((item) => normalizeSkillKey(item) === key);
      if (exists) {
        return currentSkills.filter((item) => normalizeSkillKey(item) !== key);
      }
      return [...currentSkills, skill];
    });
  }

  function resolveItem(proposal: TailorProposal, approved: boolean) {
    if (approved) {
      onApprove(proposal);
    }
    setResolvedIds((currentIds) =>
      currentIds.includes(proposal.id) ? currentIds : [...currentIds, proposal.id],
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
        className="flex max-h-[92vh] max-w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-xl border border-[color:var(--page-line)] bg-white p-0 text-[color:var(--page-text)] shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:max-w-5xl lg:max-w-6xl"
      >
        <header className="shrink-0 border-b border-[color:var(--page-line)] px-5 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <DialogTitle className="font-heading text-xl font-semibold tracking-[-0.02em] text-[color:var(--page-text)]">
                Review job edits
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-sm leading-6 text-[color:var(--page-muted)]">
                <span className="truncate">{resumeTitle}</span>
                <span aria-hidden="true"> · </span>
                {analysisResult.targetRole}
              </DialogDescription>
            </div>
            {!isLoading && totalCount > 0 ? (
              <p className="shrink-0 pt-1 text-xs font-medium tabular-nums tracking-wide text-[color:var(--page-muted)]">
                {pendingItems.length === 0
                  ? `${totalCount} of ${totalCount}`
                  : `${currentOrdinal} of ${totalCount}`}
              </p>
            ) : null}
          </div>

          <p className="mt-3 text-xs leading-5 text-[color:var(--page-muted)]">
            {Math.round(analysisResult.score)}% match
            <span aria-hidden="true"> · </span>
            {analysisResult.missingKeywords.length}{" "}
            {analysisResult.missingKeywords.length === 1 ? "word" : "words"} to add
            {totalCount > 0 ? (
              <>
                <span aria-hidden="true"> · </span>
                {totalCount} {totalCount === 1 ? "edit" : "edits"}
              </>
            ) : null}
          </p>

          {totalCount > 0 ? (
            <div
              className="mt-4 h-px overflow-hidden bg-[color:var(--page-line)]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
              aria-label="Edit review progress"
            >
              <div
                className="h-full bg-[color:var(--page-text)] transition-[width] duration-300 ease-out motion-reduce:transition-none"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          ) : null}
        </header>

        <div className="grid min-h-[28rem] flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(320px,1fr)]">
          <div className="flex min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
              {isLoading ? (
                <div className="space-y-4" aria-busy="true" aria-live="polite">
                  <div className="h-4 w-24 rounded bg-[color:var(--page-bg-strong)]" />
                  <div className="h-3 w-full max-w-md rounded bg-[color:var(--page-bg-strong)]" />
                  <div className="mt-8 h-20 rounded bg-[color:var(--page-bg-strong)]" />
                  <div className="h-28 rounded bg-[color:var(--page-bg-strong)]" />
                  <p className="pt-2 text-sm text-[color:var(--page-muted)]">Preparing edits…</p>
                </div>
              ) : error ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[color:var(--page-text)]">Couldn’t prepare edits</p>
                  <p className="text-sm leading-6 text-[color:var(--page-muted)]">{error}</p>
                </div>
              ) : pendingItems.length === 0 ? (
                <div className="flex min-h-56 flex-col items-start justify-center gap-3 py-8">
                  <CheckCircledIcon aria-hidden="true" className="size-6 text-[color:var(--page-text)]" />
                  <div className="space-y-1">
                    <p className="font-heading text-lg font-semibold tracking-[-0.02em] text-[color:var(--page-text)]">
                      Ready for the editor
                    </p>
                    <p className="max-w-md text-sm leading-6 text-[color:var(--page-muted)]">
                      Approved edits are already in the layout preview. Continue when you’re ready to fine-tune.
                    </p>
                  </div>
                </div>
              ) : current && activeProposal ? (
                <article>
                  <div className="min-w-0">
                    <h3 className="font-heading text-lg font-semibold tracking-[-0.02em] text-[color:var(--page-text)]">
                      {current.title}
                    </h3>
                    <p className="mt-1.5 max-w-prose text-sm leading-6 text-[color:var(--page-muted)]">
                      {current.type === "skills"
                        ? skillsAddedCount > 0
                          ? `Add ${skillsAddedCount} job ${skillsAddedCount === 1 ? "word" : "words"} you actually use. Tap to drop any you don’t.`
                          : "Tap skills to keep or drop them, then approve."
                        : current.description}
                    </p>
                  </div>

                  {current.type === "skills" ? (
                    <SkillsProposalDiff
                      before={current.before}
                      proposedAfter={current.after}
                      selectedSkills={selectedSkills}
                      onToggleSkill={toggleSkill}
                    />
                  ) : (
                    <ProseProposalDiff before={current.before} after={current.after} />
                  )}

                  <div className="mt-8 border-t border-[color:var(--page-line)] pt-6 lg:hidden">
                    <p className="text-[0.7rem] font-medium tracking-[0.04em] text-[color:var(--page-muted)]">
                      Layout preview
                    </p>
                    <div className="mt-3 rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg)] p-3">
                      <TailorLayoutPreview
                        form={livePreviewForm}
                        variantId={previewVariantId}
                        focusSection={focusSection}
                        compact
                      />
                    </div>
                  </div>
                </article>
              ) : null}
            </div>

            {current && activeProposal && !isLoading && !error ? (
              <div className="shrink-0 border-t border-[color:var(--page-line)] bg-white px-5 py-3 sm:px-8">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => resolveItem(current, false)}
                    className="rounded-md"
                  >
                    Skip
                  </Button>
                  <Button
                    type="button"
                    onClick={() => resolveItem(activeProposal, true)}
                    className="rounded-md bg-[#111111] text-white hover:bg-[#333333]"
                  >
                    Approve
                  </Button>
                  <p className="text-xs text-[color:var(--page-muted)] sm:ml-2">
                    {current.type === "skills"
                      ? "Approve saves your selected skills. Skip keeps your current list."
                      : "Approve adds this to your layout. Skip keeps your current text."}
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <aside className="hidden min-h-0 border-l border-[color:var(--page-line)] bg-[color:var(--page-bg)] lg:flex lg:flex-col">
            <div className="border-b border-[color:var(--page-line)] px-5 py-3">
              <p className="text-[0.7rem] font-medium tracking-[0.04em] text-[color:var(--page-muted)]">
                Layout preview
                {focusSection ? (
                  <>
                    <span aria-hidden="true"> · </span>
                    {focusSection === "summary"
                      ? "Summary"
                      : focusSection === "skills"
                        ? "Skills"
                        : "Experience"}
                  </>
                ) : null}
              </p>
            </div>
            <div className="min-h-0 flex-1 px-4 py-4">
              <TailorLayoutPreview
                form={livePreviewForm}
                variantId={previewVariantId}
                focusSection={focusSection}
                className="h-full"
              />
            </div>
          </aside>
        </div>

        <footer className="flex shrink-0 flex-col gap-2 border-t border-[color:var(--page-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <Button type="button" variant="ghost" onClick={handleFinish} disabled={isLoading} className="rounded-md">
            Review later
          </Button>
          <Button
            type="button"
            onClick={handleFinish}
            disabled={isLoading}
            className="rounded-md bg-[#111111] text-white hover:bg-[#333333]"
          >
            Continue to editor
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
