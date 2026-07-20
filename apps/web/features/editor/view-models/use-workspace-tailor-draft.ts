"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { tailorResumeDraft } from "../lib/tailor-api";
import type { ResumeForm } from "../model/resume-form";
import type { ResumeAnalysisResult } from "../model/resume-analysis";
import {
  buildTailorProposals,
  type ResumeTailorDraft,
  type TailorProposal,
} from "../model/resume-tailor-draft";

interface UseWorkspaceTailorDraftOptions {
  enabled: boolean;
  baseForm: ResumeForm;
  analysisResult: ResumeAnalysisResult | null;
  targetRole: string;
}

function cloneForm(form: ResumeForm): ResumeForm {
  return structuredClone(form);
}

function applyProposalToForm(form: ResumeForm, proposal: TailorProposal): ResumeForm {
  const next = cloneForm(form);

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

export function useWorkspaceTailorDraft({
  enabled,
  baseForm,
  analysisResult,
  targetRole,
}: UseWorkspaceTailorDraftOptions) {
  const [draft, setDraft] = useState<ResumeTailorDraft | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [approvedIds, setApprovedIds] = useState<string[]>([]);

  useEffect(() => {
    if (!enabled || !analysisResult?.jobDescription?.trim()) {
      setDraft(null);
      setError("");
      setIsLoading(false);
      setApprovedIds([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError("");
    setDraft(null);
    setApprovedIds([]);

    void tailorResumeDraft({
      targetRole: targetRole || analysisResult.targetRole,
      jobDescription: analysisResult.jobDescription,
      missingKeywords: analysisResult.missingKeywords ?? [],
      matchedKeywords: analysisResult.matchedKeywords ?? [],
      form: {
        personalInfo: baseForm.personalInfo,
        experience: baseForm.experience,
      },
    })
      .then((nextDraft) => {
        if (!cancelled) {
          setDraft(nextDraft);
        }
      })
      .catch((fetchError) => {
        if (!cancelled) {
          setDraft(null);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Unable to prepare tailored resume suggestions right now.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, analysisResult?.id, targetRole]);

  const proposals = useMemo(
    () => (draft ? buildTailorProposals(draft) : []),
    [draft],
  );

  const previewForm = useMemo(() => {
    let next = cloneForm(baseForm);
    for (const proposal of proposals) {
      if (approvedIds.includes(proposal.id)) {
        next = applyProposalToForm(next, proposal);
      }
    }
    return next;
  }, [approvedIds, baseForm, proposals]);

  const approveProposal = useCallback((proposalId: string) => {
    setApprovedIds((current) =>
      current.includes(proposalId) ? current : [...current, proposalId],
    );
  }, []);

  const applyApprovedToForm = useCallback(() => previewForm, [previewForm]);

  return {
    draft,
    proposals,
    isLoading,
    error,
    approvedIds,
    previewForm,
    approveProposal,
    applyApprovedToForm,
  };
}
