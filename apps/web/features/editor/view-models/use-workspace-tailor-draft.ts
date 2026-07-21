"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

const CACHE_PREFIX = "tailor-draft:";

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

function readCachedDraft(analysisId: string): ResumeTailorDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(`${CACHE_PREFIX}${analysisId}`);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as ResumeTailorDraft;
  } catch {
    return null;
  }
}

function writeCachedDraft(analysisId: string, draft: ResumeTailorDraft) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(`${CACHE_PREFIX}${analysisId}`, JSON.stringify(draft));
  } catch {
    // Ignore quota / private-mode failures.
  }
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
  const loadPromiseRef = useRef<Promise<ResumeTailorDraft | null> | null>(null);
  const analysisId = analysisResult?.id ?? null;

  useEffect(() => {
    setApprovedIds([]);
    setError("");
    loadPromiseRef.current = null;

    if (!enabled || !analysisId) {
      setDraft(null);
      setIsLoading(false);
      return;
    }

    const cached = readCachedDraft(analysisId);
    setDraft(cached);
    setIsLoading(false);
  }, [analysisId, enabled]);

  const ensureDraft = useCallback(async () => {
    if (!enabled || !analysisResult?.jobDescription?.trim() || !analysisId) {
      return null;
    }

    if (draft) {
      return draft;
    }

    const cached = readCachedDraft(analysisId);
    if (cached) {
      setDraft(cached);
      return cached;
    }

    if (loadPromiseRef.current) {
      return loadPromiseRef.current;
    }

    setIsLoading(true);
    setError("");

    const loadPromise = tailorResumeDraft({
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
        writeCachedDraft(analysisId, nextDraft);
        setDraft(nextDraft);
        setIsLoading(false);
        return nextDraft;
      })
      .catch((fetchError) => {
        loadPromiseRef.current = null;
        setDraft(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to prepare tailored resume suggestions right now.",
        );
        setIsLoading(false);
        return null;
      });

    loadPromiseRef.current = loadPromise;
    return loadPromise;
  }, [analysisId, analysisResult, baseForm.experience, baseForm.personalInfo, draft, enabled, targetRole]);

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
    ensureDraft,
  };
}
