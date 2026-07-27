import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { ResumeAnalysisResult } from "../model/resume-analysis";
import { emptyResumeForm, type ResumeForm } from "../model/resume-form";
import { sampleTemplates, type ResumeTemplateVariant } from "../../templates/model/template";
import { useResumeForm } from "../view-models/use-resume-form";
import { useWorkspaceModals } from "../view-models/use-workspace-modals";
import { getCreateResumeGuideState, type BuilderGuideAction } from "../view-models/create-resume-guide";
import { getAnalysisNextStepsState, type AnalysisNextStepAction } from "../view-models/analysis-next-steps";
import { markAnalysisReviewDismissed } from "../view-models/analysis-review-items";
import { useWorkspaceEnhance } from "../view-models/use-workspace-enhance";
import { useWorkspaceExport } from "../view-models/use-workspace-export";
import { useWorkspaceReanalyze } from "../view-models/use-workspace-reanalyze";
import { useWorkspaceTailorDraft } from "../view-models/use-workspace-tailor-draft";
import { cloneForm, applyProposalToForm } from "../view-models/use-workspace-tailor-draft";
import type { TailorProposal } from "../model/resume-tailor-draft";
import { ResumeTailorReviewModal } from "../components/workspace/resume-tailor-review-modal";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AnalysisProgressStatus } from "../../onboarding/components/analysis-progress-status";
import { WorkspaceHeader } from "../components/workspace/workspace-header";
import { DocumentPreview } from "../components/workspace/document-preview";
import { ContentModal } from "../components/workspace/content-modal";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProjectModal, emptyProjectDraft, type ProjectDraft } from "../components/workspace/project-modal";
import { TailorModal } from "../components/workspace/tailor-modal";
import { TemplatesModal } from "../components/workspace/templates-modal";
import { KeyboardShortcutsModal } from "../components/workspace/keyboard-shortcuts-modal";
import { WorkspaceSidebar } from "../components/workspace/workspace-sidebar";
import type { AwardsEditorMode, LeadershipEditorMode } from "../components/workspace/workspace-sidebar";
import { trackProductEvent } from "@/lib/product-events";

interface AnalysisWorkspaceProps {
  targetRole: string;
  selectedTemplateId: ResumeTemplateVariant;
  resumeFileName: string;
  resumeSourceUrl?: string | null;
  resumePreviewUrl?: string | null;
  sourcePreviewLoading?: boolean;
  sourcePreviewError?: string;
  canLoadSourcePreview?: boolean;
  onEnsureSourcePreview?: () => Promise<{
    sourceUrl: string;
    previewUrl: string | null;
  } | null>;
  analysisResult: ResumeAnalysisResult | null;
  initialForm?: ResumeForm;
  createMode?: boolean;
  autosaveKey?: string | null;
  onBack: () => void;
  onTemplateChange?: (id: ResumeTemplateVariant) => void;
  onAnalysisUpdate?: (result: ResumeAnalysisResult) => void;
  onJobDescriptionChange?: (jd: string) => void;
  onRename?: (name: string) => void;
  onResetDraft?: () => void;
  initialSuggestionsReviewOpen?: boolean;
}

type ContentModalView = "content" | "project" | "templates" | "tailor" | null;
type MobileCreateView = "editor" | "preview";

type ContentOptionId =
  | "summary"
  | "objective"
  | "projects"
  | "research"
  | "certifications"
  | "publications"
  | "skills";

function humanizeFileName(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeApplyTerm(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+.#]+/g, " ").replace(/\s+/g, " ").trim();
}

function mergeCommaList(existing: string, additions: string[]) {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const item of [...existing.split(/[,\n;]+/), ...additions]) {
    const trimmed = item.trim();
    const normalized = normalizeApplyTerm(trimmed);
    if (!trimmed || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    merged.push(trimmed);
  }

  return merged.join(", ");
}

function relativeTimeLabel(timestamp?: string) {
  if (!timestamp) {
    return "Not saved yet";
  }

  const deltaMs = Date.now() - Date.parse(timestamp);
  if (!Number.isFinite(deltaMs) || deltaMs < 0) {
    return "Saved just now";
  }

  const seconds = Math.floor(deltaMs / 1000);
  if (seconds < 60) {
    return `Saved ${seconds}s ago`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `Saved ${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Saved ${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `Saved ${days}d ago`;
}

export function AnalysisWorkspace({
  targetRole,
  selectedTemplateId,
  resumeFileName,
  resumeSourceUrl,
  resumePreviewUrl,
  sourcePreviewLoading = false,
  sourcePreviewError = "",
  canLoadSourcePreview = false,
  onEnsureSourcePreview,
  analysisResult,
  initialForm,
  createMode = false,
  autosaveKey = null,
  onBack,
  onTemplateChange,
  onAnalysisUpdate,
  onJobDescriptionChange,
  onRename,
  onResetDraft,
  initialSuggestionsReviewOpen = false,
}: AnalysisWorkspaceProps) {
  const {
    form,
    activeSectionId,
    setActiveSectionId,
    updatePersonalInfo,
    updateEducation,
    addEducation,
    removeEducation,
    updateExperience,
    addExperience,
    removeExperience,
    addExperienceBullet,
    updateExperienceBullet,
    removeExperienceBullet,
    updateLeadership,
    addLeadership,
    removeLeadership,
    updateAwards,
    addAward,
    removeAward,
    addProject,
    undo,
    redo,
    canUndo,
    canRedo,
    resetForm,
  } = useResumeForm(initialForm, { storageKey: autosaveKey, autosave: Boolean(autosaveKey) });

  const formValues = form.state.values;
  const modals = useWorkspaceModals();

  const [activeTemplateId, setActiveTemplateId] = useState(selectedTemplateId);
  const [awardsEditorMode, setAwardsEditorMode] = useState<AwardsEditorMode>("awards");
  const [leadershipEditorMode, setLeadershipEditorMode] = useState<LeadershipEditorMode>("leadership");
  const [previewZoom, setPreviewZoom] = useState(100);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(resumeFileName);
  const [saveFlash, setSaveFlash] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"saved" | "saving" | "unsaved">(
    createMode && autosaveKey ? "saved" : "unsaved",
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileCreateView, setMobileCreateView] = useState<MobileCreateView>("editor");
  const [mounted, setMounted] = useState(false);
  const [confirmBackOpen, setConfirmBackOpen] = useState(false);
  const hasStructuredResumeData = Boolean(
    analysisResult?.extractedProfile || initialForm?.personalInfo?.fullName || createMode,
  );
  const [previewMode, setPreviewMode] = useState<"uploaded" | "structured" | "parsed" | "empty">(
    hasStructuredResumeData
      ? "structured"
      : resumePreviewUrl
        ? "uploaded"
        : analysisResult?.parsedResumeText
          ? "parsed"
          : "empty",
  );

  const resumeTitle =
    editedTitle.trim() ||
    formValues.personalInfo.fullName.trim() ||
    analysisResult?.extractedProfile?.fullName.trim() ||
    humanizeFileName(resumeFileName) ||
    (createMode ? "New Resume" : "Uploaded Resume");
  const defaultTemplateId = sampleTemplates[0]?.id ?? "minimalist-grid";
  const selectedTemplate = sampleTemplates.find((template) => template.id === activeTemplateId) ?? sampleTemplates[0];

  const showToast = (message: string, type: "error" | "success") => {
    if (type === "error") {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };

  const { enhanceBullets } = useWorkspaceEnhance({
    onSuccess: (message) => showToast(message, "success"),
    onError: (message) => showToast(message, "error"),
  });

  const { exportJson: handleExportJson, downloadSource: handleDownloadSource } = useWorkspaceExport({
    resumeTitle,
    activeTemplateId,
    selectedTemplateName: selectedTemplate?.name ?? activeTemplateId,
    form: formValues,
    resumeSourceUrl,
    resumeFileName,
    analysisId: analysisResult?.id,
  });

  const handlePrint = () => {
    trackProductEvent({
      name: "resume_print",
      analysisId: analysisResult?.id,
    });
    window.print();
  };

  const handleBack = () => {
    if (form.state.isDirty) {
      setConfirmBackOpen(true);
    } else {
      onBack();
    }
  };

  const confirmBack = () => {
    setConfirmBackOpen(false);
    onBack();
  };

  const {
    newJobDescription,
    setNewJobDescription,
    isUpdatingAnalysis,
    updateError,
    reanalyzeProgress,
    tailorToJob: handleTailorToJob,
  } = useWorkspaceReanalyze({
    analysisId: analysisResult?.id,
    targetRole,
    initialJobDescription: analysisResult?.jobDescription ?? "",
    onAnalysisUpdate,
    onJobDescriptionChange,
    onComplete: () => modals.setModalView(null),
  });

  const hasStructuredPreview = previewMode === "structured";
  const canZoomDocument = previewMode !== "uploaded";
  const canShowOriginalPreview = Boolean(resumePreviewUrl || canLoadSourcePreview);
  const hasSourcePreviewChoice = Boolean(
    canShowOriginalPreview || analysisResult?.parsedResumeText || hasStructuredResumeData,
  );
  const lastSavedLabel = relativeTimeLabel(analysisResult?.generatedAt);
  const createResumeGuide = getCreateResumeGuideState(formValues, {
    hasSelectedTemplate: Boolean(selectedTemplate),
  });
  const analysisNextSteps =
    !createMode && analysisResult ? getAnalysisNextStepsState(formValues, analysisResult, targetRole) : null;
  const tailorEnabled = !createMode && Boolean(analysisResult?.extractedProfile);
  const tailorBaseForm = initialForm ?? formValues;

  const {
    proposals: tailorProposals,
    isLoading: tailorDraftLoading,
    error: tailorDraftError,
    previewForm: tailorPreviewForm,
    approveProposal,
    applyApprovedToForm,
    ensureDraft: ensureTailorDraft,
  } = useWorkspaceTailorDraft({
    enabled: tailorEnabled,
    baseForm: tailorBaseForm,
    analysisResult,
    targetRole,
  });

  const showPrimaryReviewButton = !createMode && tailorEnabled;
  const showResumePlaceholders =
    createMode ||
    Boolean(
      analysisResult &&
        !formValues.personalInfo.summary?.trim() &&
        !formValues.personalInfo.skills?.trim(),
    );

  function openPrimaryReview() {
    setPreviewMode("structured");
    if (!tailorEnabled) return;
    modals.setTailorReviewOpen(true);
    void ensureTailorDraft();
  }

  const draftStatusLabel =
    createMode && autosaveKey
      ? draftStatus === "saving"
        ? "Saving..."
        : draftStatus === "unsaved"
          ? "Unsaved"
          : "Saved locally"
      : saveFlash
        ? "Saved"
        : lastSavedLabel;

  useEffect(() => {
    setActiveTemplateId(selectedTemplateId);
  }, [selectedTemplateId]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;

      // ⌘+Z / ⌘+Shift+Z / ⌘+Y — Undo / Redo
      if (mod && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if (mod && e.key === "y") {
        e.preventDefault();
        redo();
      }

      // ⌘+K — Toggle keyboard shortcuts
      if (mod && e.key === "k") {
        e.preventDefault();
        modals.toggleShortcuts();
      }

      // ⌘+S — Save confirmation toast
      if (mod && e.key === "s") {
        e.preventDefault();
        toast.success("Saved");
      }

      // ⌘+E — Enhance focused bullet (experience editor only)
      if (mod && e.key === "e") {
        const el = document.activeElement;
        if (
          el instanceof HTMLTextAreaElement &&
          el.dataset.entryId &&
          el.dataset.bulletIndex !== undefined
        ) {
          e.preventDefault();
          const entryId = el.dataset.entryId;
          const bulletIndex = parseInt(el.dataset.bulletIndex, 10);
          const entry = formValues.experience.find((exp) => exp.id === entryId);
          if (entry && entry.bullets[bulletIndex]) {
            const bullet = entry.bullets[bulletIndex];
            void enhanceBullets(entry.role, [bullet]).then((enhanced) => {
              if (enhanced.length > 0) {
                updateExperienceBullet(entryId, bulletIndex, enhanced[0]);
              }
            });
          }
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, modals.toggleShortcuts, formValues, enhanceBullets, updateExperienceBullet]);

  // Warn before closing tab / refreshing with unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (form.state.isDirty) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.state.isDirty]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (createMode && autosaveKey) {
      setDraftStatus("saving");
      const timeout = setTimeout(() => {
        setDraftStatus("saved");
        setSaveFlash(true);
        setTimeout(() => setSaveFlash(false), 1200);
      }, 900);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 1200);
    }, 800);
    return () => clearTimeout(timeout);
  }, [autosaveKey, createMode, form]);

  useEffect(() => {
    if (
      !resumePreviewUrl &&
      !sourcePreviewLoading &&
      !canLoadSourcePreview &&
      previewMode === "uploaded"
    ) {
      setPreviewMode(
        analysisResult?.extractedProfile || initialForm?.personalInfo?.fullName
          ? "structured"
          : analysisResult?.parsedResumeText
            ? "parsed"
            : "empty",
      );
      return;
    }

    if (
      resumePreviewUrl &&
      !hasStructuredResumeData &&
      (previewMode === "parsed" || previewMode === "empty")
    ) {
      setPreviewMode("uploaded");
    }
  }, [
    analysisResult?.extractedProfile,
    analysisResult?.parsedResumeText,
    canLoadSourcePreview,
    hasStructuredResumeData,
    initialForm?.personalInfo?.fullName,
    previewMode,
    resumePreviewUrl,
    sourcePreviewLoading,
  ]);

  async function handleShowOriginalPreview() {
    setPreviewMode("uploaded");
    if (!resumePreviewUrl && onEnsureSourcePreview) {
      await onEnsureSourcePreview();
    }
  }

  async function handleDownloadOriginal() {
    if (resumeSourceUrl) {
      handleDownloadSource();
      return;
    }

    if (!onEnsureSourcePreview) {
      handleExportJson();
      return;
    }

    const loaded = await onEnsureSourcePreview();
    if (loaded?.sourceUrl) {
      const fileName = resumeFileName.trim() || "resume.pdf";
      const anchor = document.createElement("a");
      anchor.href = loaded.sourceUrl;
      anchor.download = fileName;
      anchor.rel = "noopener";
      anchor.click();
      return;
    }

    handleExportJson();
  }

  function handleSelectTemplate(templateId: ResumeTemplateVariant) {
    setActiveTemplateId(templateId);
    onTemplateChange?.(templateId);
    setPreviewMode("structured");
    modals.setPendingModalClose(true);
  }

  function handleSaveProject() {
    const trimmedName = modals.projectDraft.name.trim();
    const trimmedBullet = modals.projectDraft.bulletInput.trim();
    const normalizedBullets = trimmedBullet
      ? [...modals.projectDraft.bullets, trimmedBullet].slice(0, 3)
      : modals.projectDraft.bullets;

    if (!trimmedName) {
      modals.setProjectError("Project name is required.");
      return;
    }

    addProject({
      id: `project_${Date.now()}`,
      name: trimmedName,
      technologies: modals.projectDraft.technologies.trim(),
      link: modals.projectDraft.link.trim(),
      startDate: modals.projectDraft.startDate.trim(),
      endDate: modals.projectDraft.current ? "Present" : modals.projectDraft.endDate.trim(),
      current: modals.projectDraft.current,
      bullets: normalizedBullets,
    });

    modals.closeModal();
  }

  function handleSectionOpen(sectionId: string) {
    if (sectionId === "projects") {
      modals.openProjectModal();
      return;
    }
    if (sectionId === "leadership") {
      setLeadershipEditorMode("leadership");
    }
    if (sectionId === "awards") {
      setAwardsEditorMode("awards");
    }
    setActiveSectionId(sectionId);
  }

  function handleSectionAdd(sectionId: string) {
    if (sectionId === "projects") {
      modals.openProjectModal();
      return;
    }
    if (sectionId === "personal") {
      setActiveSectionId("personal");
      return;
    }
    if (sectionId === "education") {
      addEducation();
      setActiveSectionId("education");
      return;
    }
    if (sectionId === "experience") {
      addExperience();
      setActiveSectionId("experience");
      return;
    }
    if (sectionId === "leadership") {
      setLeadershipEditorMode("leadership");
      addLeadership();
      setActiveSectionId("leadership");
      return;
    }
    if (sectionId === "awards") {
      setAwardsEditorMode("awards");
      addAward();
      setActiveSectionId("awards");
    }
  }

  function handleAddContentOption(optionId: ContentOptionId) {
    if (optionId === "projects") {
      modals.openProjectModal();
      return;
    }
    if (optionId === "summary" || optionId === "objective" || optionId === "skills") {
      setActiveSectionId("personal");
      modals.closeModal();
      return;
    }
    if (optionId === "research") {
      setLeadershipEditorMode("research");
      addLeadership();
      setActiveSectionId("leadership");
      modals.closeModal();
      return;
    }
    if (optionId === "certifications") {
      setAwardsEditorMode("credentials");
      addAward();
      setActiveSectionId("awards");
      modals.closeModal();
      return;
    }
    if (optionId === "publications") {
      setAwardsEditorMode("publications");
      addAward();
      setActiveSectionId("awards");
      modals.closeModal();
    }
  }

  function handleGuideAction(action: BuilderGuideAction) {
    if (action !== "template") {
      modals.setModalView(null);
    }

    if (action === "personal") {
      setMobileCreateView("editor");
      setActiveSectionId("personal");
      return;
    }

    if (action === "education") {
      if (formValues.education.length === 0) addEducation();
      setMobileCreateView("editor");
      setActiveSectionId("education");
      return;
    }

    if (action === "experience") {
      if (formValues.experience.length === 0) addExperience();
      setMobileCreateView("editor");
      setActiveSectionId("experience");
      return;
    }

    if (action === "template") {
      modals.setModalView("templates");
      return;
    }

    setPreviewMode("structured");
    setMobileCreateView("preview");
  }

  function handleAnalysisStepAction(action: AnalysisNextStepAction) {
    if (action === "personal" || action === "skills") {
      setActiveSectionId("personal");
      return;
    }

    if (action === "experience") {
      if (formValues.experience.length === 0) addExperience();
      setActiveSectionId("experience");
      return;
    }

    if (action === "education") {
      if (formValues.education.length === 0) addEducation();
      setActiveSectionId("education");
      return;
    }

    setMobileSidebarOpen(false);
    modals.setModalView("tailor");
  }

  function getApplyKeywords(limit = 6) {
    const keywords = [
      ...(analysisResult?.missingKeywords ?? []),
      ...(analysisResult?.matchedKeywords ?? []),
    ];
    const seen = new Set<string>();
    const uniqueKeywords: string[] = [];

    for (const keyword of keywords) {
      const normalized = normalizeApplyTerm(keyword);
      if (!normalized || seen.has(normalized)) continue;
      seen.add(normalized);
      uniqueKeywords.push(keyword.trim());
      if (uniqueKeywords.length >= limit) break;
    }

    return uniqueKeywords;
  }

  function buildSummaryDraft() {
    const role = (targetRole || analysisResult?.targetRole || "Target role").trim();
    const keywords = getApplyKeywords(4);
    const keywordPhrase = keywords.length > 0 ? ` with experience related to ${keywords.join(", ")}` : "";
    return `${role} candidate${keywordPhrase}. Add one real result here so recruiters can see your impact.`;
  }

  function buildImpactBulletDraft() {
    const role = (targetRole || analysisResult?.targetRole || "the role").trim();
    const keywords = getApplyKeywords(3);
    const toolPhrase = keywords.length > 0 ? keywords.join(", ") : "relevant tools";
    return `Used ${toolPhrase} to improve [specific result] for [team/users] in a ${role} context. Replace brackets with a real outcome.`;
  }

  function handleApplyAnalysisStepAction(action: AnalysisNextStepAction) {
    if (action === "personal") {
      const currentSummary = formValues.personalInfo.summary.trim();
      const role = (targetRole || analysisResult?.targetRole || "").trim();
      const normalizedSummary = normalizeApplyTerm(currentSummary);
      const normalizedRole = normalizeApplyTerm(role);
      const nextSummary =
        currentSummary && normalizedRole && !normalizedSummary.includes(normalizedRole)
          ? `${role}. ${currentSummary}`
          : currentSummary || buildSummaryDraft();

      updatePersonalInfo({ summary: nextSummary });
      setActiveSectionId("personal");
      toast.success("Added an editable summary suggestion");
      return;
    }

    if (action === "skills") {
      const keywords = getApplyKeywords();
      if (keywords.length > 0) {
        updatePersonalInfo({ skills: mergeCommaList(formValues.personalInfo.skills, keywords) });
      }
      setActiveSectionId("personal");
      toast.success("Added editable job words to Skills");
      return;
    }

    if (action === "experience") {
      const bullet = buildImpactBulletDraft();
      if (formValues.experience.length === 0) {
        addExperience({
          role: targetRole || analysisResult?.targetRole || "",
          bullets: [bullet],
        });
      } else {
        addExperienceBullet(formValues.experience[0].id, bullet);
      }
      setActiveSectionId("experience");
      toast.success("Added an editable bullet suggestion");
      return;
    }

    if (action === "education") {
      if (formValues.education.length === 0) {
        addEducation();
        toast.success("Added an editable Education row");
      }
      setActiveSectionId("education");
      return;
    }

    setMobileSidebarOpen(false);
    modals.setModalView("tailor");
  }

  function handleTailorReviewFinish() {
    resetForm(applyApprovedToForm());
    setPreviewMode("structured");
    modals.setTailorReviewOpen(false);

    if (analysisResult?.id) {
      markAnalysisReviewDismissed(analysisResult.id);
    }
  }

  const previousFormRef = useRef<ResumeForm | null>(null);

  function handleTailorProposalApprove(proposal: TailorProposal) {
    // Store current form for rollback on error
    previousFormRef.current = cloneForm(formValues);
    // Optimistically apply the proposal immediately
    const nextForm = applyProposalToForm(formValues, proposal);
    resetForm(nextForm);
    approveProposal(proposal);
  }

  async function handleTailorProposalRollback() {
    if (previousFormRef.current) {
      resetForm(previousFormRef.current);
      previousFormRef.current = null;
      toast.error("Failed to save changes. Reverted to previous state.");
    }
  }

  function handleResetCreateDraft() {
    resetForm(emptyResumeForm);
    setEditedTitle("New Resume");
    setActiveTemplateId(defaultTemplateId);
    setPreviewMode("structured");
    setMobileCreateView("editor");
    setDraftStatus(autosaveKey ? "saved" : "unsaved");
    onRename?.("New Resume");
    onTemplateChange?.(defaultTemplateId);
    onResetDraft?.();
  }

  function adjustPreviewZoom(delta: number) {
    setPreviewZoom((currentZoom) => Math.max(70, Math.min(160, currentZoom + delta)));
  }

  return (
    <div className="relative flex h-[100dvh] max-h-[100dvh] min-h-0 flex-1 flex-col overflow-hidden bg-[color:var(--page-surface)] text-[color:var(--page-text)]">
      {isUpdatingAnalysis && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-white/70 px-4 backdrop-blur-sm">
          <AnalysisProgressStatus
            variant="overlay"
            title="Re-checking your resume"
            steps={reanalyzeProgress.steps}
            activeStepIndex={reanalyzeProgress.activeStepIndex}
          />
        </div>
      )}

      {analysisResult && tailorEnabled ? (
        <ResumeTailorReviewModal
          key={`${analysisResult.id}-tailor`}
          open={modals.tailorReviewOpen}
          onOpenChange={(open) => {
            modals.setTailorReviewOpen(open);
            if (!open && analysisResult.id && tailorProposals.length === 0) {
              markAnalysisReviewDismissed(analysisResult.id);
            }
          }}
          analysisResult={analysisResult}
          resumeTitle={resumeTitle}
          proposals={tailorProposals}
          isLoading={tailorDraftLoading}
          error={tailorDraftError}
          previewForm={tailorPreviewForm}
          previewVariantId={activeTemplateId}
          onApprove={handleTailorProposalApprove}
          onFinish={handleTailorReviewFinish}
        />
      ) : null}

      <WorkspaceHeader
        createMode={createMode}
        resumeTitle={resumeTitle}
        editedTitle={editedTitle}
        isEditingTitle={isEditingTitle}
        draftStatusLabel={draftStatusLabel}
        showPrimaryReviewButton={showPrimaryReviewButton}
        analysisResult={analysisResult}
        selectedTemplateName={selectedTemplate?.name ?? ""}
        canUndo={canUndo}
        canRedo={canRedo}
        sourcePreviewLoading={sourcePreviewLoading}
        resumeSourceUrl={resumeSourceUrl}
        canLoadSourcePreview={canLoadSourcePreview}
        onBack={handleBack}
        onEditTitleChange={setEditedTitle}
        onStartEditTitle={() => setIsEditingTitle(true)}
        onStopEditTitle={() => {
          setIsEditingTitle(false);
          setEditedTitle(resumeFileName);
        }}
        onSaveTitle={() => onRename?.(editedTitle)}
        onOpenPrimaryReview={openPrimaryReview}
        onOpenTailorModal={() => modals.setModalView("tailor")}
        onOpenTemplatesModal={() => modals.setModalView("templates")}
        onOpenShortcutsModal={() => modals.openShortcuts()}
        onUndo={undo}
        onRedo={redo}
        onPrint={handlePrint}
        onDownloadOriginal={() => void handleDownloadOriginal()}
        onMobileSidebarOpen={() => setMobileSidebarOpen(true)}
      />

      {createMode && (
        <div className="border-b border-[color:var(--page-line)] bg-white px-4 py-3 xl:hidden">
          <ToggleGroup
            type="single"
            value={mobileCreateView}
            onValueChange={(value) => {
              if (value === "editor" || value === "preview") {
                setMobileCreateView(value);
              }
            }}
            variant="outline"
            size="lg"
            className="grid w-full grid-cols-2"
          >
            <ToggleGroupItem value="editor" aria-label="Show editor" className="w-full">
              Editor
            </ToggleGroupItem>
            <ToggleGroupItem value="preview" aria-label="Show preview" className="w-full">
              Preview
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      )}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {!createMode && mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm xl:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        <ErrorBoundary label="editor sidebar">
          <WorkspaceSidebar
            activeSectionId={activeSectionId}
            setActiveSectionId={setActiveSectionId}
            formValues={formValues}
            createMode={createMode}
            resumeTitle={resumeTitle}
            mounted={mounted}
            analysisResult={analysisResult}
            targetRole={targetRole}
            tailorEnabled={tailorEnabled}
            tailorDraftLoading={tailorDraftLoading}
            tailorProposals={tailorProposals}
            leadershipEditorMode={leadershipEditorMode}
            awardsEditorMode={awardsEditorMode}
            setLeadershipEditorMode={setLeadershipEditorMode}
            setAwardsEditorMode={setAwardsEditorMode}
            enhanceBullets={enhanceBullets}
            updatePersonalInfo={updatePersonalInfo}
            updateEducation={updateEducation}
            addEducation={addEducation}
            removeEducation={removeEducation}
            updateExperience={updateExperience}
            addExperience={addExperience}
            removeExperience={removeExperience}
            addExperienceBullet={addExperienceBullet}
            updateExperienceBullet={updateExperienceBullet}
            removeExperienceBullet={removeExperienceBullet}
            updateLeadership={updateLeadership}
            addLeadership={addLeadership}
            removeLeadership={removeLeadership}
            updateAwards={updateAwards}
            addAward={addAward}
            removeAward={removeAward}
            openPrimaryReview={openPrimaryReview}
            handleGuideAction={handleGuideAction}
            handleAnalysisStepAction={handleAnalysisStepAction}
            handleApplyAnalysisStepAction={handleApplyAnalysisStepAction}
            handleExportJson={handleExportJson}
            handlePrint={handlePrint}
            handleResetCreateDraft={handleResetCreateDraft}
            openAddContentModal={() => modals.setModalView("content")}
            openProjectModal={modals.openProjectModal}
            setMobileSidebarOpen={setMobileSidebarOpen}
            mobileSidebarOpen={mobileSidebarOpen}
          />
        </ErrorBoundary>

      <section
          className={`${createMode && mobileCreateView === "editor" ? "hidden xl:flex" : "flex"} min-h-0 flex-1 overflow-hidden bg-[color:var(--page-bg-strong)]`}
        >
          <div className="flex h-full flex-1 gap-0">
            <ErrorBoundary label="document preview">
              <DocumentPreview
                previewMode={previewMode}
                previewZoom={previewZoom}
                resumePreviewUrl={resumePreviewUrl}
                sourcePreviewLoading={sourcePreviewLoading}
                sourcePreviewError={sourcePreviewError}
                canLoadSourcePreview={canLoadSourcePreview}
                canZoomDocument={canZoomDocument}
                parsedResumeText={analysisResult?.parsedResumeText}
                form={formValues}
                activeTemplateId={activeTemplateId}
                showResumePlaceholders={showResumePlaceholders}
                showDownloadButton={!createMode}
                onAdjustZoom={adjustPreviewZoom}
                onDownloadOriginal={() => void handleDownloadOriginal()}
                onShowOriginalPreview={() => void handleShowOriginalPreview()}
                onShowLayoutPreview={() => setPreviewMode("structured")}
                hasSourcePreviewChoice={hasSourcePreviewChoice}
              />
            </ErrorBoundary>
          </div>
        </section>
      </div>

      <ContentModal
        open={modals.modalView === "content"}
        onOpenChange={(open) => open ? modals.setModalView("content") : modals.closeModal()}
        onSelectOption={handleAddContentOption}
        onOpenProjectModal={modals.openProjectModal}
      />

      <ProjectModal
        open={modals.modalView === "project"}
        onOpenChange={(open) => open ? modals.setModalView("project") : modals.closeModal()}
        draft={modals.projectDraft}
        onDraftChange={(key, value) => modals.updateProjectDraft(key, value)}
        formError={modals.projectFormError}
        onSave={handleSaveProject}
        onClearError={() => modals.clearProjectError()}
      />

      <TailorModal
        open={modals.modalView === "tailor"}
        onOpenChange={(open) => open ? modals.setModalView("tailor") : modals.closeModal()}
        jobDescription={newJobDescription}
        onJobDescriptionChange={setNewJobDescription}
        isUpdating={isUpdatingAnalysis}
        updateError={updateError}
        onTailor={handleTailorToJob}
        onRetry={handleTailorToJob}
      />

      <TemplatesModal
        open={modals.modalView === "templates"}
        onOpenChange={(open) => open ? modals.setModalView("templates") : modals.closeModal()}
        activeTemplateId={activeTemplateId}
        onSelectTemplate={handleSelectTemplate}
      />

      <KeyboardShortcutsModal
        open={modals.showShortcuts}
        onOpenChange={modals.closeShortcuts}
      />

      <AlertDialog open={confirmBackOpen} onOpenChange={setConfirmBackOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes that will be lost if you leave. Your work
              is auto-saved to your browser, but you may want to stay and review
              before going back.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBack}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
