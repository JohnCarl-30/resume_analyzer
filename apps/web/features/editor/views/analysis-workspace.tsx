import React, { useEffect, useRef, useState } from "react";
import type { ResumeAnalysisResult } from "../model/resume-analysis";
import { emptyResumeForm, type ResumeForm } from "../model/resume-form";
import { sampleTemplates, type ResumeTemplateVariant } from "../../templates/model/template";
import { useResumeEditor } from "../view-models/use-resume-editor";
import { getCreateResumeGuideState, type BuilderGuideAction } from "../view-models/create-resume-guide";
import { getAnalysisNextStepsState, type AnalysisNextStepAction } from "../view-models/analysis-next-steps";
import {
  hasDismissedAnalysisReview,
  markAnalysisReviewDismissed,
} from "../view-models/analysis-review-items";
import { useWorkspaceEnhance } from "../view-models/use-workspace-enhance";
import { useWorkspaceExport } from "../view-models/use-workspace-export";
import { useWorkspaceReanalyze } from "../view-models/use-workspace-reanalyze";
import { useWorkspaceTailorDraft } from "../view-models/use-workspace-tailor-draft";
import type { TailorProposal } from "../model/resume-tailor-draft";
import { PersonalInfoEditor } from "../components/editors/personal-info-editor";
import { ExperienceEditor } from "../components/editors/experience-editor";
import { EducationEditor } from "../components/editors/education-editor";
import { LeadershipEditor } from "../components/editors/leadership-editor";
import { AwardsEditor } from "../components/editors/awards-editor";
import { CreateResumeGuide } from "../components/workspace/create-resume-guide";
import { AnalysisNextSteps } from "../components/workspace/analysis-next-steps";
import { ResumeTailorReviewModal } from "../components/workspace/resume-tailor-review-modal";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AnalysisProgressStatus } from "../../onboarding/components/analysis-progress-status";
import { CloseIcon } from "../../onboarding/components/wizard-icons";

import { WorkspaceHeader } from "../components/workspace/workspace-header";
import { DocumentPreview } from "../components/workspace/document-preview";
import { ContentModal } from "../components/workspace/content-modal";
import { ProjectModal, emptyProjectDraft, type ProjectDraft } from "../components/workspace/project-modal";
import { TailorModal } from "../components/workspace/tailor-modal";
import { TemplatesModal } from "../components/workspace/templates-modal";
import { KeyboardShortcutsModal } from "../components/workspace/keyboard-shortcuts-modal";

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

const workspaceSections = [
  { id: "personal", label: "Personal Info", icon: "personal", expanded: true },
  { id: "education", label: "Education", icon: "education", expanded: false },
  { id: "experience", label: "Work Experience", icon: "experience", expanded: false },
  { id: "leadership", label: "Leadership", icon: "leadership", expanded: false },
  { id: "awards", label: "Awards & Honors", icon: "awards", expanded: false },
] as const;

type ContentModalView = "content" | "project" | "templates" | "tailor" | null;
type MobileCreateView = "editor" | "preview";
type AwardsEditorMode = "awards" | "credentials" | "publications";
type LeadershipEditorMode = "leadership" | "research";

type ContentOptionId =
  | "summary"
  | "objective"
  | "projects"
  | "research"
  | "certifications"
  | "publications"
  | "skills";

const awardsEditorCopy: Record<
  AwardsEditorMode,
  { title: string; addLabel: string; placeholder: string }
> = {
  awards: {
    title: "Awards & Honors",
    addLabel: "Add Award",
    placeholder: "e.g. Dean's Lister - 2023",
  },
  credentials: {
    title: "Credentials & Certifications",
    addLabel: "Add Credential",
    placeholder: "e.g. AWS Certified Cloud Practitioner - Amazon, 2025",
  },
  publications: {
    title: "Publications",
    addLabel: "Add Publication",
    placeholder: "e.g. Article Title - Publication, 2025",
  },
};

const leadershipEditorCopy: Record<
  LeadershipEditorMode,
  {
    title: string;
    addLabel: string;
    roleLabel: string;
    rolePlaceholder: string;
    organizationLabel: string;
    organizationPlaceholder: string;
    locationLabel: string;
    locationPlaceholder: string;
    dateLabel: string;
    datePlaceholder: string;
  }
> = {
  leadership: {
    title: "Leadership",
    addLabel: "Add another Entry",
    roleLabel: "Leadership Role",
    rolePlaceholder: "President",
    organizationLabel: "Organization",
    organizationPlaceholder: "Student Council",
    locationLabel: "Location",
    locationPlaceholder: "City, Province",
    dateLabel: "Date Range",
    datePlaceholder: "Jan 2023 — Present",
  },
  research: {
    title: "Research",
    addLabel: "Add Research Entry",
    roleLabel: "Research Title",
    rolePlaceholder: "Undergraduate Researcher",
    organizationLabel: "Institution / Lab",
    organizationPlaceholder: "Human-Computer Interaction Lab",
    locationLabel: "Location",
    locationPlaceholder: "City, Country",
    dateLabel: "Date Range",
    datePlaceholder: "2024 — Present",
  },
};

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

function sectionIcon(icon: string) {
  const iconMap: Record<string, React.ReactNode> = {
    personal: <span>👤</span>,
    education: <span>🎓</span>,
    experience: <span>💼</span>,
    leadership: <span>👥</span>,
    awards: <span>🏆</span>,
    projects: <span>🔧</span>,
  };
  return iconMap[icon] ?? <span>✨</span>;
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
  } = useResumeEditor(initialForm, { storageKey: autosaveKey, autosave: Boolean(autosaveKey) });

  const [activeTemplateId, setActiveTemplateId] = useState(selectedTemplateId);
  const [pendingModalClose, setPendingModalClose] = useState(false);
  const [modalView, setModalView] = useState<ContentModalView>(null);
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>(emptyProjectDraft);
  const [projectFormError, setProjectFormError] = useState("");
  const [awardsEditorMode, setAwardsEditorMode] = useState<AwardsEditorMode>("awards");
  const [leadershipEditorMode, setLeadershipEditorMode] = useState<LeadershipEditorMode>("leadership");
  const [previewZoom, setPreviewZoom] = useState(100);
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(resumeFileName);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const [draftStatus, setDraftStatus] = useState<"saved" | "saving" | "unsaved">(
    createMode && autosaveKey ? "saved" : "unsaved",
  );
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [mobileCreateView, setMobileCreateView] = useState<MobileCreateView>("editor");
  const [mounted, setMounted] = useState(false);
  const [tailorReviewOpen, setTailorReviewOpen] = useState(false);
  const autoOpenedTailorAnalysisIdRef = useRef<string | null>(null);
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
    form.personalInfo.fullName.trim() ||
    analysisResult?.extractedProfile?.fullName.trim() ||
    humanizeFileName(resumeFileName) ||
    (createMode ? "New Resume" : "Uploaded Resume");
  const defaultTemplateId = sampleTemplates[0]?.id ?? "minimalist-grid";
  const selectedTemplate = sampleTemplates.find((template) => template.id === activeTemplateId) ?? sampleTemplates[0];

  const showToast = (message: string, type: "error" | "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), type === "error" ? 5000 : 3000);
  };

  const { enhanceBullets } = useWorkspaceEnhance({
    onSuccess: (message) => showToast(message, "success"),
    onError: (message) => showToast(message, "error"),
  });

  const { exportJson: handleExportJson, downloadSource: handleDownloadSource } = useWorkspaceExport({
    resumeTitle,
    activeTemplateId,
    selectedTemplateName: selectedTemplate?.name ?? activeTemplateId,
    form,
    resumeSourceUrl,
    resumeFileName,
  });

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
    onComplete: () => setModalView(null),
  });

  const hasStructuredPreview = previewMode === "structured";
  const canZoomDocument = previewMode !== "uploaded";
  const canShowOriginalPreview = Boolean(resumePreviewUrl || canLoadSourcePreview);
  const hasSourcePreviewChoice = Boolean(
    canShowOriginalPreview || analysisResult?.parsedResumeText || hasStructuredResumeData,
  );
  const lastSavedLabel = relativeTimeLabel(analysisResult?.generatedAt);
  const createResumeGuide = getCreateResumeGuideState(form, {
    hasSelectedTemplate: Boolean(selectedTemplate),
  });
  const analysisNextSteps =
    !createMode && analysisResult ? getAnalysisNextStepsState(form, analysisResult, targetRole) : null;
  const tailorEnabled = !createMode && Boolean(analysisResult?.extractedProfile);
  const tailorBaseForm = initialForm ?? form;

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
        !form.personalInfo.summary?.trim() &&
        !form.personalInfo.skills?.trim(),
    );

  function openPrimaryReview() {
    setPreviewMode("structured");
    if (!tailorEnabled) return;
    setTailorReviewOpen(true);
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

  const editorSections = [
    ...workspaceSections,
    ...(form.projects.length > 0
      ? [{ id: "projects", label: "Projects", icon: "projects" as const, expanded: false }]
      : []),
  ];

  useEffect(() => {
    setActiveTemplateId(selectedTemplateId);
  }, [selectedTemplateId]);

  useEffect(() => {
    if (pendingModalClose) {
      setModalView(null);
      setPendingModalClose(false);
    }
  }, [pendingModalClose]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (createMode || !analysisResult?.id || hasDismissedAnalysisReview(analysisResult.id)) {
      return;
    }

    if (!initialSuggestionsReviewOpen || !tailorEnabled) {
      return;
    }

    if (autoOpenedTailorAnalysisIdRef.current === analysisResult.id) {
      return;
    }

    autoOpenedTailorAnalysisIdRef.current = analysisResult.id;
    setTailorReviewOpen(true);
    setPreviewMode("structured");
    void ensureTailorDraft();
  }, [
    analysisResult?.id,
    createMode,
    ensureTailorDraft,
    initialSuggestionsReviewOpen,
    tailorEnabled,
  ]);

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

  function openAddContentModal() {
    setModalView("content");
    setProjectFormError("");
  }

  function openProjectModal() {
    setModalView("project");
    setProjectFormError("");
  }

  function closeModal() {
    setModalView(null);
    setProjectFormError("");
    setProjectDraft(emptyProjectDraft);
  }

  function handleSelectTemplate(templateId: ResumeTemplateVariant) {
    setActiveTemplateId(templateId);
    onTemplateChange?.(templateId);
    setPreviewMode("structured");
    setPendingModalClose(true);
  }

  function handleSaveProject() {
    const trimmedName = projectDraft.name.trim();
    const trimmedBullet = projectDraft.bulletInput.trim();
    const normalizedBullets = trimmedBullet
      ? [...projectDraft.bullets, trimmedBullet].slice(0, 3)
      : projectDraft.bullets;

    if (!trimmedName) {
      setProjectFormError("Project name is required.");
      return;
    }

    addProject({
      id: `project_${Date.now()}`,
      name: trimmedName,
      technologies: projectDraft.technologies.trim(),
      link: projectDraft.link.trim(),
      startDate: projectDraft.startDate.trim(),
      endDate: projectDraft.current ? "Present" : projectDraft.endDate.trim(),
      current: projectDraft.current,
      bullets: normalizedBullets,
    });

    closeModal();
  }

  function handleSectionOpen(sectionId: string) {
    if (sectionId === "projects") {
      openProjectModal();
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
      openProjectModal();
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
      openProjectModal();
      return;
    }
    if (optionId === "summary" || optionId === "objective" || optionId === "skills") {
      setActiveSectionId("personal");
      closeModal();
      return;
    }
    if (optionId === "research") {
      setLeadershipEditorMode("research");
      addLeadership();
      setActiveSectionId("leadership");
      closeModal();
      return;
    }
    if (optionId === "certifications") {
      setAwardsEditorMode("credentials");
      addAward();
      setActiveSectionId("awards");
      closeModal();
      return;
    }
    if (optionId === "publications") {
      setAwardsEditorMode("publications");
      addAward();
      setActiveSectionId("awards");
      closeModal();
    }
  }

  function handleGuideAction(action: BuilderGuideAction) {
    if (action !== "template") {
      setModalView(null);
    }

    if (action === "personal") {
      setMobileCreateView("editor");
      setActiveSectionId("personal");
      return;
    }

    if (action === "education") {
      if (form.education.length === 0) addEducation();
      setMobileCreateView("editor");
      setActiveSectionId("education");
      return;
    }

    if (action === "experience") {
      if (form.experience.length === 0) addExperience();
      setMobileCreateView("editor");
      setActiveSectionId("experience");
      return;
    }

    if (action === "template") {
      setModalView("templates");
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
      if (form.experience.length === 0) addExperience();
      setActiveSectionId("experience");
      return;
    }

    if (action === "education") {
      if (form.education.length === 0) addEducation();
      setActiveSectionId("education");
      return;
    }

    setMobileSidebarOpen(false);
    setModalView("tailor");
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
      const currentSummary = form.personalInfo.summary.trim();
      const role = (targetRole || analysisResult?.targetRole || "").trim();
      const normalizedSummary = normalizeApplyTerm(currentSummary);
      const normalizedRole = normalizeApplyTerm(role);
      const nextSummary =
        currentSummary && normalizedRole && !normalizedSummary.includes(normalizedRole)
          ? `${role}. ${currentSummary}`
          : currentSummary || buildSummaryDraft();

      updatePersonalInfo({ summary: nextSummary });
      setActiveSectionId("personal");
      setToast({ message: "Added an editable summary suggestion", type: "success" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (action === "skills") {
      const keywords = getApplyKeywords();
      if (keywords.length > 0) {
        updatePersonalInfo({ skills: mergeCommaList(form.personalInfo.skills, keywords) });
      }
      setActiveSectionId("personal");
      setToast({ message: "Added editable job words to Skills", type: "success" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (action === "experience") {
      const bullet = buildImpactBulletDraft();
      if (form.experience.length === 0) {
        addExperience({
          role: targetRole || analysisResult?.targetRole || "",
          bullets: [bullet],
        });
      } else {
        addExperienceBullet(form.experience[0].id, bullet);
      }
      setActiveSectionId("experience");
      setToast({ message: "Added an editable bullet suggestion", type: "success" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (action === "education") {
      if (form.education.length === 0) {
        addEducation();
        setToast({ message: "Added an editable Education row", type: "success" });
        setTimeout(() => setToast(null), 3000);
      }
      setActiveSectionId("education");
      return;
    }

    setMobileSidebarOpen(false);
    setModalView("tailor");
  }

  function handleTailorReviewFinish() {
    resetForm(applyApprovedToForm());
    setPreviewMode("structured");
    setTailorReviewOpen(false);

    if (analysisResult?.id) {
      markAnalysisReviewDismissed(analysisResult.id);
    }
  }

  function handleTailorProposalApprove(proposal: TailorProposal) {
    approveProposal(proposal.id);
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

  function renderEditor() {
    if (activeSectionId === "personal") {
      return (
        <PersonalInfoEditor
          data={form.personalInfo}
          onChange={updatePersonalInfo}
          onBack={() => setActiveSectionId(null)}
        />
      );
    }
    if (activeSectionId === "experience") {
      return (
        <ExperienceEditor
          entries={form.experience}
          onAdd={addExperience}
          onUpdate={updateExperience}
          onRemove={removeExperience}
          onAddBullet={addExperienceBullet}
          onUpdateBullet={updateExperienceBullet}
          onRemoveBullet={removeExperienceBullet}
          onEnhanceBullets={async (_id, role, bullets) => enhanceBullets(role, bullets)}
          onBack={() => setActiveSectionId(null)}
        />
      );
    }
    if (activeSectionId === "education") {
      return (
        <EducationEditor
          entries={form.education}
          onAdd={addEducation}
          onUpdate={updateEducation}
          onRemove={removeEducation}
          onBack={() => setActiveSectionId(null)}
        />
      );
    }
    if (activeSectionId === "leadership") {
      const copy = leadershipEditorCopy[leadershipEditorMode];
      return (
        <LeadershipEditor
          entries={form.leadership}
          onAdd={addLeadership}
          onUpdate={updateLeadership}
          onRemove={removeLeadership}
          onBack={() => setActiveSectionId(null)}
          title={copy.title}
          addLabel={copy.addLabel}
          roleLabel={copy.roleLabel}
          rolePlaceholder={copy.rolePlaceholder}
          organizationLabel={copy.organizationLabel}
          organizationPlaceholder={copy.organizationPlaceholder}
          locationLabel={copy.locationLabel}
          locationPlaceholder={copy.locationPlaceholder}
          dateLabel={copy.dateLabel}
          datePlaceholder={copy.datePlaceholder}
        />
      );
    }
    if (activeSectionId === "awards") {
      const copy = awardsEditorCopy[awardsEditorMode];
      return (
        <AwardsEditor
          entries={form.awards}
          onAdd={addAward}
          onUpdate={updateAwards}
          onRemove={removeAward}
          onBack={() => setActiveSectionId(null)}
          title={copy.title}
          addLabel={copy.addLabel}
          placeholder={copy.placeholder}
        />
      );
    }

    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-b border-[color:var(--page-line)] px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[color:var(--page-text)]">
              {createMode ? "Resume Builder" : "Resume Sections"}
            </h2>
            <p className="mt-1 truncate text-xs text-[color:var(--page-muted)]">
              {createMode ? "Local draft" : resumeTitle}
            </p>
          </div>
        </div>

        <div className={`min-h-0 flex-1 overflow-y-auto px-3 py-2 ${createMode ? "pb-6 xl:pb-3" : "pb-5"}`}>
          {createMode && (
            <div className="mb-4">
              <CreateResumeGuide
                guide={createResumeGuide}
                onAction={handleGuideAction}
                onPrint={() => window.print()}
                onBackupDraft={handleExportJson}
                onResetDraft={handleResetCreateDraft}
              />
            </div>
          )}
          {analysisNextSteps && (
            <div className="mb-3">
              <AnalysisNextSteps
                guide={analysisNextSteps}
                onAction={handleAnalysisStepAction}
                onApply={handleApplyAnalysisStepAction}
                preferTailorFlow={tailorEnabled}
                tailor={
                  tailorEnabled
                    ? {
                        isLoading: tailorDraftLoading,
                        pendingCount: tailorProposals.length,
                        available: true,
                        onReview: openPrimaryReview,
                      }
                    : undefined
                }
              />
            </div>
          )}
          {editorSections.map((section, index) => {
            const isEmpty =
              section.id === "education" ? form.education.length === 0 :
              section.id === "experience" ? form.experience.length === 0 :
              section.id === "leadership" ? form.leadership.length === 0 :
              section.id === "awards" ? form.awards.length === 0 :
              section.id === "personal" ? (!form.personalInfo.fullName && !form.personalInfo.email) :
              false;
            const emptyHints: Record<string, string> = {
              personal: "Add your name, contact, and summary",
              education: "No education yet — add your degree",
              experience: "No work experience yet — add your first role",
              leadership: "No leadership entries yet",
              awards: "No awards or honors yet",
            };

            return (
              <div
                key={section.id}
                className={`${index === 0 ? "" : "border-t border-[color:var(--page-line)]"} rounded-[10px] px-2 py-3 transition hover:bg-[color:var(--page-bg)]`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSectionOpen(section.id)}
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[color:var(--page-muted)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--brand)]"
                    >
                      {activeSectionId === section.id ? <span>▼</span> : <span>▶</span>}
                    </button>
                    <span className="text-[color:var(--page-muted)]">{sectionIcon(section.icon)}</span>
                    <button
                      type="button"
                      onClick={() => handleSectionOpen(section.id)}
                      className="text-sm font-medium text-[color:var(--page-text)] transition hover:text-[color:var(--brand)]"
                    >
                      {section.label}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {section.id === "personal" ? (
                      <button
                        type="button"
                        onClick={() => setActiveSectionId(section.id)}
                        className="text-[color:var(--brand)] transition hover:text-[color:var(--brand-strong)]"
                        aria-label="Edit section"
                      >
                        <span>✏️</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSectionAdd(section.id)}
                          className="text-[color:var(--brand)] transition hover:text-[color:var(--brand-strong)]"
                          aria-label="Add item"
                        >
                          <span>➕</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSectionOpen(section.id)}
                          className="text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)]"
                          aria-label="Open section"
                        >
                          <span>▶</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {mounted && isEmpty && (
                  <div className="ml-11 mt-1 truncate text-xs text-[color:var(--page-muted)] opacity-70">
                    {emptyHints[section.id]}
                  </div>
                )}
              </div>
            );
          })}
          {createMode && (
            <div className="px-2 pb-5 pt-2">
              <button
                type="button"
                onClick={openAddContentModal}
                className="inline-flex w-full items-center justify-center gap-3 rounded-[14px] border border-[color:var(--page-line)] bg-[color:var(--page-surface)] px-4 py-3 text-base font-medium text-[color:var(--page-text)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
              >
                <span>➕</span>
                Add Section
              </button>
            </div>
          )}
        </div>

        {!createMode && (
          <div className="mt-auto border-t border-[color:var(--page-line)] px-3 py-3">
            <button
              type="button"
              onClick={openAddContentModal}
              className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-[color:var(--page-line)] bg-[color:var(--page-surface)] px-3 py-2.5 text-sm font-medium text-[color:var(--page-text)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
            >
              <span>➕</span>
              Add Section
            </button>
          </div>
        )}
      </div>
    );
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

      {toast && (
        <div className="absolute left-1/2 top-4 z-[70] -translate-x-1/2">
          <div
            className={`rounded-lg px-5 py-3 text-sm font-medium shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition ${
              toast.type === "error"
                ? "border border-[#f1c9c7] bg-[#fdebec] text-[#9f2f2d]"
                : "border border-[#cfe0cd] bg-[#edf3ec] text-[#346538]"
            }`}
          >
            {toast.message}
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-3 text-xs font-semibold uppercase tracking-wider opacity-70 hover:opacity-100"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {analysisResult && tailorEnabled ? (
        <ResumeTailorReviewModal
          key={`${analysisResult.id}-tailor`}
          open={tailorReviewOpen}
          onOpenChange={(open) => {
            setTailorReviewOpen(open);
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
        onBack={onBack}
        onEditTitleChange={setEditedTitle}
        onStartEditTitle={() => setIsEditingTitle(true)}
        onStopEditTitle={() => {
          setIsEditingTitle(false);
          setEditedTitle(resumeFileName);
        }}
        onSaveTitle={() => onRename?.(editedTitle)}
        onOpenPrimaryReview={openPrimaryReview}
        onOpenTailorModal={() => setModalView("tailor")}
        onOpenTemplatesModal={() => setModalView("templates")}
        onOpenShortcutsModal={() => setShowShortcuts(true)}
        onUndo={undo}
        onRedo={redo}
        onPrint={() => window.print()}
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
        <aside
          className={`shrink-0 border-r border-[color:var(--page-line)] bg-white transition-transform duration-300 ease-in-out ${
            createMode
              ? `${mobileCreateView === "editor" ? "flex" : "hidden"} w-full border-r-0 xl:flex xl:w-[390px] xl:border-r`
              : `fixed inset-y-0 left-0 z-50 w-80 transform ${
                  mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } xl:static xl:z-auto xl:w-[360px] xl:transform-none xl:translate-x-0 2xl:w-[400px]`
          }`}
        >
          <div className="flex h-full flex-col">
            <div className={`${createMode ? "hidden" : "flex"} items-center justify-between border-b border-[color:var(--page-line)] px-4 py-3 xl:hidden`}>
              <span className="font-semibold text-[color:var(--page-text)]">Editor</span>
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[color:var(--page-line)] text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)]"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {renderEditor()}
            </div>
          </div>
        </aside>

        <section
          className={`${createMode && mobileCreateView === "editor" ? "hidden xl:flex" : "flex"} min-h-0 flex-1 overflow-hidden bg-[color:var(--page-bg-strong)]`}
        >
          <div className="flex h-full flex-1 gap-0">
            <DocumentPreview
              previewMode={previewMode}
              previewZoom={previewZoom}
              resumePreviewUrl={resumePreviewUrl}
              sourcePreviewLoading={sourcePreviewLoading}
              sourcePreviewError={sourcePreviewError}
              canLoadSourcePreview={canLoadSourcePreview}
              canZoomDocument={canZoomDocument}
              parsedResumeText={analysisResult?.parsedResumeText}
              form={form}
              activeTemplateId={activeTemplateId}
              showResumePlaceholders={showResumePlaceholders}
              showDownloadButton={!createMode}
              onAdjustZoom={adjustPreviewZoom}
              onDownloadOriginal={() => void handleDownloadOriginal()}
              onShowOriginalPreview={() => void handleShowOriginalPreview()}
              hasSourcePreviewChoice={hasSourcePreviewChoice}
            />
          </div>
        </section>
      </div>

      <ContentModal
        open={modalView === "content"}
        onOpenChange={(open) => open ? setModalView("content") : closeModal()}
        onSelectOption={handleAddContentOption}
        onOpenProjectModal={openProjectModal}
      />

      <ProjectModal
        open={modalView === "project"}
        onOpenChange={(open) => open ? setModalView("project") : closeModal()}
        draft={projectDraft}
        onDraftChange={(key, value) => setProjectDraft((current) => ({ ...current, [key]: value }))}
        formError={projectFormError}
        onSave={handleSaveProject}
        onClearError={() => setProjectFormError("")}
      />

      <TailorModal
        open={modalView === "tailor"}
        onOpenChange={(open) => open ? setModalView("tailor") : closeModal()}
        jobDescription={newJobDescription}
        onJobDescriptionChange={setNewJobDescription}
        isUpdating={isUpdatingAnalysis}
        updateError={updateError}
        onTailor={handleTailorToJob}
        onRetry={handleTailorToJob}
      />

      <TemplatesModal
        open={modalView === "templates"}
        onOpenChange={(open) => open ? setModalView("templates") : closeModal()}
        activeTemplateId={activeTemplateId}
        onSelectTemplate={handleSelectTemplate}
      />

      <KeyboardShortcutsModal
        open={showShortcuts}
        onOpenChange={setShowShortcuts}
      />
    </div>
  );
}
