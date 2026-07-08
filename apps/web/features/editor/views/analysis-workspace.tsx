import React, { useEffect, useState } from "react";
import type { ResumeAnalysisResult } from "../model/resume-analysis";
import { emptyResumeForm, type ResumeForm } from "../model/resume-form";
import { sampleTemplates, type ResumeTemplateVariant } from "../../templates/model/template";
import { TemplateCard } from "../../templates/components/template-card";
import { useResumeEditor } from "../view-models/use-resume-editor";
import { getCreateResumeGuideState, type BuilderGuideAction } from "../view-models/create-resume-guide";
import { getAnalysisNextStepsState, type AnalysisNextStepAction } from "../view-models/analysis-next-steps";
import { PersonalInfoEditor } from "../components/editors/personal-info-editor";
import { ExperienceEditor } from "../components/editors/experience-editor";
import { EducationEditor } from "../components/editors/education-editor";
import { LeadershipEditor } from "../components/editors/leadership-editor";
import { AwardsEditor } from "../components/editors/awards-editor";
import { ResumeRenderer } from "../components/resume-renderer";
import { CreateResumeGuide } from "../components/workspace/create-resume-guide";
import { AnalysisNextSteps } from "../components/workspace/analysis-next-steps";
import { apiClient } from "../../../lib/api-instance";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import {
  ArrowLeftIcon,
  UserCircleIcon,
  GraduationCapIcon,
  BriefcaseOutlineIcon,
  UsersIcon,
  TrophyIcon,
  SparklesIcon,
  PencilIcon,
  ClockIcon,
  EyeIcon,
  GridIcon,
  SearchIcon,
  DownloadIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FileIcon,
  TargetIcon,
  CodeBracketsIcon,
  ResearchIcon,
  BadgeIcon,
  BookOpenIcon,
  CloseIcon,
  TrashIcon,
  CalendarIcon,
  UndoIcon,
  RedoIcon,
  KeyboardIcon,
  CheckCircleIcon,
  MenuIcon,
} from "../../onboarding/components/wizard-icons";

interface AnalysisWorkspaceProps {
  targetRole: string;
  selectedTemplateId: ResumeTemplateVariant;
  resumeFileName: string;
  resumeSourceUrl?: string | null;
  resumePreviewUrl?: string | null;
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

interface ContentOption {
  id: ContentOptionId;
  title: string;
  description: string;
  icon: "file" | "target" | "projects" | "research" | "badge" | "book" | "skills";
  interactive?: boolean;
}

interface ProjectDraft {
  name: string;
  technologies: string;
  link: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bulletInput: string;
  bullets: string[];
}

const maxProjectBullets = 3;

const addContentOptions: ContentOption[] = [
  {
    id: "summary",
    title: "Professional Summary",
    description: "Brief overview of your experience and strengths",
    icon: "file",
  },
  {
    id: "objective",
    title: "Career Objective",
    description: "Your career goals and target role",
    icon: "target",
  },
  {
    id: "projects",
    title: "Projects",
    description: "Showcase notable projects and technologies",
    icon: "projects",
    interactive: true,
  },
  {
    id: "research",
    title: "Research",
    description: "Research papers, theses, and academic work",
    icon: "research",
  },
  {
    id: "certifications",
    title: "Certifications",
    description: "Professional credentials, certifications, and licenses",
    icon: "badge",
  },
  {
    id: "publications",
    title: "Publications",
    description: "Published papers, articles, and books",
    icon: "book",
  },
  {
    id: "skills",
    title: "Skills",
    description: "List your technical and professional skills",
    icon: "skills",
  },
];

const emptyProjectDraft: ProjectDraft = {
  name: "",
  technologies: "",
  link: "",
  startDate: "",
  endDate: "",
  current: false,
  bulletInput: "",
  bullets: [],
};

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

function slugifyFileName(value: string) {
  const slug = humanizeFileName(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "resume";
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

function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100) / 100;
  const offset = circumference - progress * circumference;

  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="4" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-[0.65rem] font-bold" style={{ color }}>
        {Math.round(score)}%
      </span>
    </div>
  );
}

function isLikelyHeading(line: string) {
  const normalizedLine = line.trim();

  if (!normalizedLine) {
    return false;
  }

  return /^(summary|objective|education|experience|work experience|leadership|projects|skills|awards|honors|publications|certifications)$/i.test(
    normalizedLine,
  );
}

function normalizeResumeBlocks(text: string) {
  return text
    .split(/\n{2,}/)
    .map((block) =>
      block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .filter((block) => block.length > 0);
}

function ParsedTextPreview({ text }: { text: string }) {
  const blocks = normalizeResumeBlocks(text).slice(0, 28);

  return (
    <div className="font-serif text-[0.96rem] leading-7 text-slate-800">
      {blocks.map((block, blockIndex) => {
        const firstLine = block[0] ?? "";
        const remainingLines = block.slice(1);

        if (isLikelyHeading(firstLine)) {
          return (
            <section key={`${firstLine}-${blockIndex}`} className="pt-7 first:pt-0">
              <div className="border-b border-slate-300 pb-2">
                <h3 className="text-[1.75rem] font-semibold uppercase tracking-[0.08em] text-slate-900">
                  {firstLine}
                </h3>
              </div>
              <div className="space-y-2 pt-4">
                {remainingLines.map((line, lineIndex) => (
                  <p key={`${line}-${lineIndex}`} className="whitespace-pre-wrap">
                    {line}
                  </p>
                ))}
              </div>
            </section>
          );
        }

        return (
          <div key={`${firstLine}-${blockIndex}`} className="mb-5 space-y-1 last:mb-0">
            {block.map((line, lineIndex) =>
              blockIndex === 0 && lineIndex === 0 ? (
                <h1
                  key={`${line}-${lineIndex}`}
                  className="text-center text-[2.65rem] font-semibold uppercase tracking-tight text-slate-950"
                >
                  {line}
                </h1>
              ) : (
                <p
                  key={`${line}-${lineIndex}`}
                  className={`${blockIndex === 0 ? "text-center text-[1.02rem] text-slate-500" : "whitespace-pre-wrap"}`}
                >
                  {line}
                </p>
              ),
            )}
          </div>
        );
      })}
    </div>
  );
}

export function AnalysisWorkspace({
  targetRole,
  selectedTemplateId,
  resumeFileName,
  resumeSourceUrl,
  resumePreviewUrl,
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
  const [isUpdatingAnalysis, setIsUpdatingAnalysis] = useState(false);
  const [newJobDescription, setNewJobDescription] = useState(analysisResult?.jobDescription ?? "");
  const [updateError, setUpdateError] = useState("");
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
  const [previewMode, setPreviewMode] = useState<"uploaded" | "structured" | "parsed" | "empty">(
    resumePreviewUrl
      ? "uploaded"
      : analysisResult?.extractedProfile || initialForm?.personalInfo?.fullName || createMode
        ? "structured"
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
  const hasStructuredPreview = previewMode === "structured";
  const canZoomDocument = previewMode !== "uploaded";
  const hasSourcePreviewChoice = Boolean(resumePreviewUrl || analysisResult?.parsedResumeText);
  const lastSavedLabel = relativeTimeLabel(analysisResult?.generatedAt);
  const defaultTemplateId = sampleTemplates[0]?.id ?? "minimalist-grid";
  const selectedTemplate = sampleTemplates.find((template) => template.id === activeTemplateId) ?? sampleTemplates[0];
  const createResumeGuide = getCreateResumeGuideState(form, {
    hasSelectedTemplate: Boolean(selectedTemplate),
  });
  const analysisNextSteps =
    !createMode && analysisResult ? getAnalysisNextStepsState(form, analysisResult, targetRole) : null;
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
      ? [
          {
            id: "projects",
            label: "Projects",
            icon: "projects" as const,
            expanded: false,
          },
        ]
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
    if (!resumePreviewUrl && previewMode === "uploaded") {
      setPreviewMode(
        analysisResult?.extractedProfile || initialForm?.personalInfo?.fullName
          ? "structured"
          : analysisResult?.parsedResumeText
            ? "parsed"
            : "empty",
      );
      return;
    }

    if (resumePreviewUrl && (previewMode === "parsed" || previewMode === "empty")) {
      setPreviewMode("uploaded");
    }
  }, [analysisResult?.extractedProfile, analysisResult?.parsedResumeText, previewMode, resumePreviewUrl, initialForm?.personalInfo?.fullName]);

  function sectionIcon(icon: (typeof editorSections)[number]["icon"]) {
    if (icon === "personal") return <UserCircleIcon />;
    if (icon === "education") return <GraduationCapIcon />;
    if (icon === "experience") return <BriefcaseOutlineIcon />;
    if (icon === "leadership") return <UsersIcon />;
    if (icon === "awards") return <TrophyIcon />;
    if (icon === "projects") return <CodeBracketsIcon />;
    return <SparklesIcon />;
  }

  function contentOptionIcon(icon: ContentOption["icon"]) {
    if (icon === "file") return <FileIcon />;
    if (icon === "target") return <TargetIcon />;
    if (icon === "projects") return <CodeBracketsIcon />;
    if (icon === "research") return <ResearchIcon />;
    if (icon === "badge") return <BadgeIcon />;
    if (icon === "book") return <BookOpenIcon />;
    return <SparklesIcon />;
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

  function updateProjectDraft<K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) {
    setProjectDraft((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleCompleteBullet() {
    const baseText = projectDraft.bulletInput.trim();
    const autoCompletedText = baseText
      ? `${baseText.replace(/[.]+$/, "")}.`
      : projectDraft.name.trim()
        ? `Built ${projectDraft.name.trim()} using ${projectDraft.technologies.trim() || "modern tools"} and shipped a measurable improvement.`
        : "Built a feature that improved usability, speed, or delivery for the team.";

    updateProjectDraft("bulletInput", autoCompletedText);
  }

  function handleAddBullet() {
    const nextBullet = projectDraft.bulletInput.trim();
    if (!nextBullet || projectDraft.bullets.length >= maxProjectBullets) return;

    setProjectDraft((current) => ({
      ...current,
      bullets: [...current.bullets, nextBullet],
      bulletInput: "",
    }));
  }

  function handleRemoveBullet(index: number) {
    setProjectDraft((current) => ({
      ...current,
      bullets: current.bullets.filter((_, bulletIndex) => bulletIndex !== index),
    }));
  }

  function handleSaveProject() {
    const trimmedName = projectDraft.name.trim();
    const trimmedBullet = projectDraft.bulletInput.trim();
    const normalizedBullets = trimmedBullet
      ? [...projectDraft.bullets, trimmedBullet].slice(0, maxProjectBullets)
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
    if (optionId === "summary" || optionId === "objective") {
      setActiveSectionId("personal");
      closeModal();
      return;
    }
    if (optionId === "skills") {
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
      if (form.education.length === 0) {
        addEducation();
      }
      setMobileCreateView("editor");
      setActiveSectionId("education");
      return;
    }

    if (action === "experience") {
      if (form.experience.length === 0) {
        addExperience();
      }
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
      if (form.experience.length === 0) {
        addExperience();
      }
      setActiveSectionId("experience");
      return;
    }

    if (action === "education") {
      if (form.education.length === 0) {
        addEducation();
      }
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
      if (!normalized || seen.has(normalized)) {
        continue;
      }
      seen.add(normalized);
      uniqueKeywords.push(keyword.trim());
      if (uniqueKeywords.length >= limit) {
        break;
      }
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
          onEnhanceBullets={async (id, role, bullets) => {
            try {
              const data = await apiClient.post<string[]>("/api/enhance/bullets", {
                role,
                bullets,
              });
              setToast({ message: "Bullets enhanced successfully", type: "success" });
              setTimeout(() => setToast(null), 3000);
              return data;
            } catch (err) {
              setToast({ message: err instanceof Error ? err.message : "Enhancement failed", type: "error" });
              setTimeout(() => setToast(null), 5000);
              throw err;
            }
          }}
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
                      {activeSectionId === section.id ? <ChevronDownIcon /> : <ChevronRightIcon />}
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
                        <PencilIcon />
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSectionAdd(section.id)}
                          className="text-[color:var(--brand)] transition hover:text-[color:var(--brand-strong)]"
                          aria-label="Add item"
                        >
                          <PlusIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSectionOpen(section.id)}
                          className="text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)]"
                          aria-label="Open section"
                        >
                          <ChevronRightIcon />
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
                <PlusIcon />
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
              <PlusIcon />
              Add Section
            </button>
          </div>
        )}
      </div>
    );
  }

  function adjustPreviewZoom(delta: number) {
    setPreviewZoom((currentZoom) => Math.max(70, Math.min(160, currentZoom + delta)));
  }

  function handleExportJson() {
    const payload = {
      title: resumeTitle,
      selectedTemplateId: activeTemplateId,
      selectedTemplateName: selectedTemplate?.name ?? activeTemplateId,
      form,
      exportedAt: new Date().toISOString(),
    };
    const fallback = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const fallbackUrl = URL.createObjectURL(fallback);
    const anchor = document.createElement("a");
    anchor.href = fallbackUrl;
    anchor.download = `${slugifyFileName(resumeTitle)}-draft.json`;
    anchor.click();
    URL.revokeObjectURL(fallbackUrl);
  }

  function handleExportResume() {
    if (resumeSourceUrl) {
      const anchor = document.createElement("a");
      anchor.href = resumeSourceUrl;
      anchor.download = resumeFileName;
      anchor.click();
      return;
    }

    handleExportJson();
  }

  function handleDownloadSource() {
    handleExportResume();
  }

  async function handleTailorToJob() {
    if (!analysisResult?.id) return;

    setUpdateError("");
    setIsUpdatingAnalysis(true);

    try {
      const { updateResumeAnalysis } = await import("../../onboarding/utils/analysis-api");
      const updated = await updateResumeAnalysis(analysisResult.id, {
        jobDescription: newJobDescription,
        targetRole,
      });

      onAnalysisUpdate?.(updated);
      onJobDescriptionChange?.(newJobDescription);
      closeModal();
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : "Failed to re-analyze resume.");
    } finally {
      setIsUpdatingAnalysis(false);
    }
  }

  function renderDocumentPreview() {
    if (previewMode === "uploaded" && resumePreviewUrl) {
      return (
        <div className="mx-auto aspect-[1/1.414] w-full max-w-[860px] overflow-hidden rounded-lg border border-[color:var(--page-line)] bg-white shadow-sm">
          <iframe
            key={`${resumePreviewUrl}-${previewZoom}`}
            title="Uploaded resume preview"
            src={`${resumePreviewUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=${previewZoom}`}
            className="h-full w-full bg-white"
          />
        </div>
      );
    }

    if (previewMode === "parsed" && analysisResult?.parsedResumeText) {
      return (
        <div
          className="print-resume mx-auto aspect-[1/1.414] w-full max-w-[860px] overflow-hidden rounded-lg border border-[color:var(--page-line)] bg-white px-10 py-12 shadow-sm sm:px-14 sm:py-16"
          style={{
            transform: `scale(${previewZoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          <ParsedTextPreview text={analysisResult.parsedResumeText} />
        </div>
      );
    }

    if (hasStructuredPreview) {
      return (
        <div
          className="print-resume mx-auto aspect-[1/1.414] w-full max-w-[860px] overflow-hidden rounded-lg border border-[color:var(--page-line)] bg-white px-8 py-10 shadow-sm sm:px-12 sm:py-14 lg:px-16 lg:py-16"
          style={{
            transform: `scale(${previewZoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          <ResumeRenderer form={form} variantId={activeTemplateId} showPlaceholders={createMode} />
        </div>
      );
    }

    return (
      <div className="mx-auto flex aspect-[1/1.414] w-full max-w-[860px] items-center justify-center rounded-lg border border-dashed border-[color:var(--page-line)] bg-white px-8 py-10 text-center shadow-sm">
        <div className="max-w-md space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
            Preview unavailable
          </p>
          <h3 className="text-2xl font-semibold tracking-tight text-[color:var(--page-text)]">
            We parsed the file, but there isn&apos;t enough structured content to draw the page yet.
          </h3>
          <p className="text-base leading-7 text-[color:var(--page-muted)]">
            Try a clearer PDF, enable OpenAI extraction, or upload a resume with selectable text so the preview
            can mirror your content more closely.
          </p>
        </div>
      </div>
    );
  }

  const openTailorModal = () => setModalView("tailor");

  return (
    <div className="relative flex h-[100dvh] max-h-[100dvh] min-h-0 flex-1 flex-col overflow-hidden bg-[color:var(--page-surface)] text-[color:var(--page-text)]">
      {isUpdatingAnalysis && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[color:var(--brand)] border-t-transparent"></div>
            <p className="text-lg font-medium text-[color:var(--page-text)]">
              Checking your resume against the new job post...
            </p>
          </div>
        </div>
      )}
      {toast && (
        <div className="absolute left-1/2 top-4 z-[70] -translate-x-1/2">
          <div
            className={`rounded-[14px] px-5 py-3 text-sm font-medium shadow-lg transition ${
              toast.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
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
      <header className="shrink-0 border-b border-[color:var(--page-line)] bg-white px-3 py-2 sm:px-4">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-2 text-sm sm:gap-3">
            {!createMode && (
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[12px] border border-[color:var(--page-line)] bg-white px-2.5 py-2 text-sm font-medium text-[color:var(--page-text)] transition hover:bg-[color:var(--page-bg-strong)] xl:hidden"
                aria-label="Open resume editor"
              >
                <MenuIcon />
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={onBack}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-[12px] border border-[color:var(--page-line)] bg-white px-2.5 py-2 text-xs font-medium text-[color:var(--page-muted)] transition hover:border-[color:var(--page-line-strong)] hover:text-[color:var(--page-text)] sm:px-3 sm:text-sm"
            >
              <ArrowLeftIcon />
              Back
            </button>
            {isEditingTitle ? (
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setIsEditingTitle(false);
                      onRename?.(editedTitle);
                    }
                    if (e.key === "Escape") {
                      setIsEditingTitle(false);
                      setEditedTitle(resumeFileName);
                    }
                  }}
                  autoFocus
                  className="min-w-[12rem] flex-1 rounded-[14px] border border-[color:var(--brand)] bg-white px-3 py-2 text-base font-semibold text-[color:var(--page-text)] outline-none sm:px-4 sm:text-xl"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingTitle(false);
                    onRename?.(editedTitle);
                  }}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-[color:var(--brand)] hover:bg-[color:var(--brand-soft)]"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingTitle(false);
                    setEditedTitle(resumeFileName);
                  }}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-[color:var(--page-muted)] hover:bg-[color:var(--page-bg)]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                className="group inline-flex min-w-0 flex-1 items-center gap-2 rounded-[12px] border border-transparent bg-slate-50/50 px-2.5 py-1 text-sm font-semibold text-[color:var(--page-text)] transition hover:bg-slate-100/80 active:scale-[0.98] sm:flex-none sm:px-3 sm:text-base xl:max-w-[22rem]"
                aria-label={createMode ? "Edit draft title" : "Edit resume title"}
              >
                <span className="truncate">{resumeTitle}</span>
                <span className="text-[color:var(--page-muted)] opacity-0 transition group-hover:opacity-100">
                  <PencilIcon />
                </span>
              </button>
            )}
            {createMode && (
              <div className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[color:var(--brand-soft)] px-2.5 py-1 text-[0.68rem] font-medium text-[color:var(--brand)] sm:hidden">
                <span className={draftStatusLabel === "Saving..." ? "text-[color:var(--page-muted)]" : "text-emerald-600"}>
                  {draftStatusLabel === "Saving..." ? <ClockIcon /> : <CheckCircleIcon />}
                </span>
                <span>{draftStatusLabel}</span>
              </div>
            )}
          </div>

          <div
            className={`items-center gap-2 ${
              createMode
                ? "hidden overflow-x-auto [scrollbar-width:none] sm:flex sm:flex-wrap [&::-webkit-scrollbar]:hidden"
                : "flex flex-nowrap"
            }`}
          >
            {!createMode && analysisResult && (
              <div className="hidden shrink-0 items-center gap-2 rounded-[12px] border border-[color:var(--page-line)] bg-white px-2.5 py-1.5 sm:inline-flex">
                <ScoreRing score={analysisResult.score} size={34} />
                <div className="text-xs leading-tight">
                  <div className="font-bold text-[color:var(--page-text)]">{Math.round(analysisResult.score)}% match</div>
                  <div className="text-[color:var(--page-muted)]">
                    {analysisResult.matchedKeywords.length}{" "}
                    {analysisResult.matchedKeywords.length === 1 ? "job word" : "job words"} found
                  </div>
                </div>
              </div>
            )}

            <div className={`shrink-0 items-center gap-1 ${createMode ? "hidden" : "hidden md:inline-flex"}`}>
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                className="inline-flex items-center justify-center rounded-l-[14px] border border-[color:var(--page-line)] bg-white px-2.5 py-2 text-sm text-[color:var(--page-text)] transition hover:bg-[color:var(--page-bg-strong)] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:py-2.5"
                aria-label="Undo"
                title="Undo"
              >
                <UndoIcon />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                className="inline-flex items-center justify-center rounded-r-[14px] border border-l-0 border-[color:var(--page-line)] bg-white px-2.5 py-2 text-sm text-[color:var(--page-text)] transition hover:bg-[color:var(--page-bg-strong)] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 sm:py-2.5"
                aria-label="Redo"
                title="Redo"
              >
                <RedoIcon />
              </button>
            </div>
            <div className={`min-w-[6.5rem] shrink-0 items-center gap-2 rounded-[12px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-2.5 py-2 text-xs text-[color:var(--page-muted)] sm:px-3 sm:text-sm ${
              createMode ? "hidden sm:inline-flex" : "hidden sm:inline-flex"
            }`}>
              <span className={draftStatusLabel === "Saving..." ? "text-[color:var(--page-muted)]" : "text-emerald-500"}>
                {draftStatusLabel === "Saving..." ? <ClockIcon /> : <CheckCircleIcon />}
              </span>
              <span className={draftStatusLabel === "Saved locally" || draftStatusLabel === "Saved" ? "font-medium text-emerald-600" : ""}>
                {draftStatusLabel}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowShortcuts(true)}
              className={`shrink-0 items-center justify-center rounded-[12px] border border-[color:var(--page-line)] bg-white px-3 py-2 text-sm text-[color:var(--page-text)] transition hover:bg-[color:var(--page-bg-strong)] ${
                createMode ? "hidden" : "hidden 2xl:inline-flex"
              }`}
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts"
            >
              <KeyboardIcon />
            </button>

            {!createMode && (
              <button
                type="button"
                onClick={openTailorModal}
                aria-label="Check resume again"
                className="inline-flex shrink-0 items-center gap-2 rounded-[12px] bg-[color:var(--brand)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(79,107,255,0.22)] transition hover:bg-[color:var(--brand-strong)]"
              >
                <EyeIcon />
                <span aria-hidden="true" className="hidden sm:inline">Check again</span>
                <span aria-hidden="true" className="sm:hidden">Check</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setModalView("templates")}
              aria-label="Choose resume style"
              className="group hidden max-w-[9rem] shrink-0 items-center gap-2 rounded-[12px] border border-[color:var(--page-line)] bg-white px-3 py-2 text-xs font-medium text-[color:var(--page-text)] transition hover:border-[color:var(--page-line-strong)] hover:bg-[color:var(--page-bg-strong)] active:scale-[0.98] sm:inline-flex sm:max-w-none sm:text-sm"
            >
              <span className={createMode ? "hidden sm:inline-flex" : "inline-flex"}>
                <GridIcon />
              </span>
              <span className="truncate">
                {createMode ? (selectedTemplate?.name ?? "Choose style") : `Style: ${selectedTemplate?.name ?? "Choose"}`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              aria-label="Print or save PDF"
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-[12px] border border-[color:var(--page-line)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--page-text)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] sm:px-4 sm:text-sm"
            >
              <span className={createMode ? "hidden sm:inline-flex" : "inline-flex"}>
                <DownloadIcon />
              </span>
              <span aria-hidden="true" className="hidden sm:inline">Print / Save PDF</span>
              <span aria-hidden="true" className="sm:hidden">Print</span>
            </button>

            {!createMode && (
              <button
                type="button"
                onClick={handleDownloadSource}
                disabled={!resumeSourceUrl}
                className="hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-[12px] border border-[color:var(--page-line)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--page-text)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[color:var(--page-line)] disabled:hover:text-[color:var(--page-text)] 2xl:inline-flex"
              >
                <DownloadIcon />
                {resumeSourceUrl ? "Download original" : "Backup copy"}
              </button>
            )}
          </div>
        </div>
      </header>

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
            <div className="relative min-h-0 flex-1 overflow-hidden bg-[color:var(--page-bg-strong)]">
              <div className="pointer-events-none absolute inset-x-2 top-3 z-20 flex justify-center">
                <div className="pointer-events-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-[color:var(--page-line)] bg-white/95 px-2 py-1.5 shadow-sm [scrollbar-width:none] sm:gap-2 sm:px-2.5 [&::-webkit-scrollbar]:hidden">
                  {hasSourcePreviewChoice ? (
                    <div className="flex shrink-0 items-center gap-1 rounded-full bg-slate-50 p-0.5">
                      {resumePreviewUrl ? (
                        <button
                          type="button"
                          onClick={() => setPreviewMode("uploaded")}
                          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-medium transition ${
                            previewMode === "uploaded"
                              ? "bg-white text-[color:var(--brand)] shadow-sm"
                              : "text-[color:var(--page-muted)] hover:text-[color:var(--page-text)]"
                          }`}
                        >
                          <FileIcon />
                          Original
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setPreviewMode("structured")}
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-medium transition ${
                          previewMode === "structured"
                            ? "bg-white text-[color:var(--brand)] shadow-sm"
                            : "text-[color:var(--page-muted)] hover:text-[color:var(--page-text)]"
                        }`}
                      >
                        <SparklesIcon />
                        Layout
                      </button>
                    </div>
                  ) : null}

                  {hasSourcePreviewChoice && (
                    <div className="mx-0.5 h-7 w-px shrink-0 bg-[color:var(--page-line)] sm:mx-1" />
                  )}

                  <button
                    type="button"
                    onClick={() => adjustPreviewZoom(-10)}
                    disabled={!canZoomDocument}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[color:var(--page-muted)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Zoom out"
                  >
                    <SearchIcon />
                  </button>
                  <span className="min-w-10 shrink-0 text-center text-xs font-semibold text-[color:var(--page-muted)]">
                    {previewZoom}%
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustPreviewZoom(10)}
                    disabled={!canZoomDocument}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[color:var(--page-muted)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Zoom in"
                  >
                    <PlusIcon />
                  </button>
                  {!createMode && (
                    <>
                      <div className="mx-1 h-7 w-px bg-[color:var(--page-line)]" />
                      <button
                        type="button"
                        onClick={handleDownloadSource}
                        disabled={!resumeSourceUrl}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--page-muted)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Download source file"
                      >
                        <DownloadIcon />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="h-full overflow-auto px-4 pb-8 pt-16 sm:px-6 sm:pt-[4.5rem]">
                {renderDocumentPreview()}
              </div>
            </div>
          </div>
        </section>
      </div>

      <Dialog
        open={Boolean(modalView)}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
      >
        {modalView ? (
          <DialogContent
            showCloseButton={false}
            className="max-h-[92vh] max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-xl border border-[color:var(--page-line)] bg-white p-0 text-[color:var(--page-text)] shadow-lg sm:max-w-5xl"
          >
            {modalView === "content" ? (
              <>
                <div className="flex items-center justify-between border-b border-[color:var(--page-line)] px-5 py-4 sm:px-6">
                  <DialogTitle className="text-xl font-semibold tracking-tight text-[color:var(--page-text)]">
                    Add Content
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Choose optional resume sections or content blocks to add to your resume.
                  </DialogDescription>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-surface)] text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)]"
                    aria-label="Close add content"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <div className="px-5 py-5 sm:px-6 sm:py-6">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {addContentOptions.map((option) =>
                      option.interactive ? (
                        <button
                          key={option.id}
                          type="button"
                          onClick={openProjectModal}
                          className="rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-surface)] p-4 text-left transition hover:border-[color:var(--brand)]"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-white text-[color:var(--page-muted)]">
                              {contentOptionIcon(option.icon)}
                            </div>
                            <div className="space-y-1">
                              <p className="text-base font-semibold text-[color:var(--page-text)]">
                                {option.title}
                              </p>
                              <p className="text-sm leading-5 text-[color:var(--page-muted)]">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ) : (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handleAddContentOption(option.id)}
                          className="rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-surface)] p-4 text-left transition hover:border-[color:var(--brand)]"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-white text-[color:var(--page-muted)]">
                              {contentOptionIcon(option.icon)}
                            </div>
                            <div className="space-y-1">
                              <p className="text-base font-semibold text-[color:var(--page-text)]">
                                {option.title}
                              </p>
                              <p className="text-sm leading-5 text-[color:var(--page-muted)]">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </>
            ) : modalView === "project" ? (
              <>
                <div className="flex items-center justify-between border-b border-[color:var(--page-line)] px-5 py-4 sm:px-6">
                  <DialogTitle className="text-xl font-semibold tracking-tight text-[color:var(--page-text)]">
                    Add Project
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    Add a project with technologies, dates, links, and bullet details.
                  </DialogDescription>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-surface)] text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)]"
                    aria-label="Close add projects"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <div className="max-h-[calc(92vh-5rem)] overflow-y-auto px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        value={projectDraft.name}
                        onChange={(event) => updateProjectDraft("name", event.target.value)}
                        placeholder="E-Commerce Platform"
                        className="w-full rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                        Technologies
                      </label>
                      <input
                        type="text"
                        value={projectDraft.technologies}
                        onChange={(event) => updateProjectDraft("technologies", event.target.value)}
                        placeholder="React, Node.js, PostgreSQL"
                        className="w-full rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)]"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                        Project Link <span className="text-[color:var(--page-muted)]">(Optional)</span>
                      </label>
                      <input
                        type="url"
                        value={projectDraft.link}
                        onChange={(event) => updateProjectDraft("link", event.target.value)}
                        placeholder="https://github.com/username/project"
                        className="w-full rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)]"
                      />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                          Start Date
                        </label>
                        <div className="flex items-center justify-between rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3">
                          <input
                            type="text"
                            value={projectDraft.startDate}
                            onChange={(event) => updateProjectDraft("startDate", event.target.value)}
                            placeholder="January 2024"
                            className="w-full bg-transparent text-base text-[color:var(--page-text)] outline-none placeholder:text-[color:var(--page-muted)]"
                          />
                          <span className="ml-4 text-[color:var(--page-muted)]">
                            <CalendarIcon />
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                          End Date
                        </label>
                        <div className="flex items-center justify-between rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3">
                          <input
                            type="text"
                            value={projectDraft.endDate}
                            onChange={(event) => updateProjectDraft("endDate", event.target.value)}
                            placeholder="March 2024"
                            disabled={projectDraft.current}
                            className="w-full bg-transparent text-base text-[color:var(--page-text)] outline-none placeholder:text-[color:var(--page-muted)] disabled:opacity-50"
                          />
                          <span className="ml-4 text-[color:var(--page-muted)]">
                            <CalendarIcon />
                          </span>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 text-sm text-[color:var(--page-text)]">
                      <input
                        type="checkbox"
                        checked={projectDraft.current}
                        onChange={(event) => updateProjectDraft("current", event.target.checked)}
                        className="size-4 rounded border border-[color:var(--page-line)]"
                      />
                      Currently working on this project
                    </label>

                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-4">
                        <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                          Project Description
                        </label>
                        <button
                          type="button"
                          onClick={handleAddBullet}
                          className="inline-flex h-8 items-center gap-2 rounded-lg border border-[color:var(--page-line)] bg-white px-3 text-sm font-medium text-[color:var(--page-text)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                        >
                          <PlusIcon />
                          Add Bullet
                        </button>
                      </div>

                      {projectDraft.bullets.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {projectDraft.bullets.map((bullet, index) => (
                            <div
                              key={`${bullet}-${index}`}
                              className="flex items-start justify-between gap-3 rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-surface)] px-4 py-3"
                            >
                              <p className="text-base leading-7 text-[color:var(--page-text)]">{bullet}</p>
                              <button
                                type="button"
                                onClick={() => handleRemoveBullet(index)}
                                className="text-[color:var(--page-muted)] transition hover:text-rose-500"
                                aria-label="Remove bullet"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <div className="rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg)] p-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => updateProjectDraft("bulletInput", "")}
                            className="text-[color:var(--page-muted)] transition hover:text-rose-500"
                            aria-label="Clear current bullet"
                          >
                            <TrashIcon />
                          </button>
                        </div>

                        <textarea
                          value={projectDraft.bulletInput}
                          onChange={(event) => updateProjectDraft("bulletInput", event.target.value)}
                          placeholder="Built a feature that..."
                          className="mt-3 min-h-[8rem] w-full resize-none bg-transparent text-base leading-7 text-[color:var(--page-text)] outline-none placeholder:text-[color:var(--page-muted)]"
                        />

                        <div className="mt-5 flex flex-col gap-4 border-t border-[color:var(--page-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-base text-[color:var(--page-muted)]">
                            {Math.max(0, maxProjectBullets - projectDraft.bullets.length)} left
                          </p>
                          <button
                            type="button"
                            onClick={handleCompleteBullet}
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-[color:var(--page-line)] bg-white px-3 text-sm font-semibold text-[color:var(--brand)] transition hover:border-[color:var(--brand)]"
                          >
                            <SparklesIcon />
                            Complete Bullet
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-[color:var(--page-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="min-h-6 text-sm text-rose-500">{projectFormError}</div>
                  <div className="flex items-center justify-end gap-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-white px-4 text-sm font-medium text-[color:var(--page-text)] transition hover:border-[color:var(--page-line-strong)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProject}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-[color:var(--brand)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-strong)]"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </>
            ) : modalView === "tailor" ? (
              <>
                <div className="flex items-center justify-between border-b border-[color:var(--page-line)] px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-1">
                    <DialogTitle className="text-xl font-semibold tracking-tight text-[color:var(--page-text)]">
                      Check a different job post
                    </DialogTitle>
                    <DialogDescription className="text-sm text-[color:var(--page-muted)]">
                      Paste a new job post and we&apos;ll refresh the tips for that role.
                    </DialogDescription>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-surface)] text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)]"
                    aria-label="Close tailor modal"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <div className="px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                          Job Post
                        </label>
                        <span className="text-xs text-[color:var(--page-muted)]">
                          {newJobDescription.trim().length} characters
                        </span>
                      </div>
                      <textarea
                        value={newJobDescription}
                        onChange={(e) => setNewJobDescription(e.target.value)}
                        placeholder="Paste the full job post here..."
                        className="min-h-[320px] w-full resize-none rounded-lg border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-base leading-7 text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)]"
                      />
                      {newJobDescription.length < 30 && newJobDescription.length > 0 && (
                        <p className="text-xs text-[#e16f62]">
                          Paste at least 30 characters from the job post.
                        </p>
                      )}
                    </div>

                    {updateError && (
                      <div className="flex items-start gap-3 rounded-xl bg-rose-50 px-4 py-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-rose-600">
                            {updateError}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleTailorToJob}
                          disabled={isUpdatingAnalysis}
                          className="ml-2 whitespace-nowrap rounded-md bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:opacity-50"
                          aria-label="Retry resume check"
                        >
                          Retry
                        </button>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeModal}
                        disabled={isUpdatingAnalysis}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-white px-4 text-sm font-semibold text-[color:var(--page-text)] transition hover:bg-[color:var(--page-bg-strong)] disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isUpdatingAnalysis || newJobDescription.length < 30}
                        onClick={handleTailorToJob}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[color:var(--brand)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-strong)] disabled:opacity-50"
                      >
                        {isUpdatingAnalysis ? "Checking..." : "Check resume"}
                        {!isUpdatingAnalysis && <SparklesIcon />}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : modalView === "templates" ? (
              <div className="flex h-full flex-col">
                <header className="flex shrink-0 items-center justify-between border-b border-[color:var(--page-line)] px-5 py-4 sm:px-6">
                  <div className="flex flex-col gap-1">
                    <DialogTitle className="text-xl font-semibold tracking-tight text-[color:var(--page-text)]">
                      Choose resume style
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      Choose a resume style and preview your content in that layout.
                    </DialogDescription>
                    <p className="text-sm text-[color:var(--page-muted)]">Preview your content in another layout.</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="group flex size-9 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-white transition hover:border-[color:var(--page-line-strong)] hover:bg-[color:var(--page-bg-strong)] active:scale-95"
                    aria-label="Close modal"
                  >
                    <CloseIcon />
                  </button>
                </header>

                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sampleTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        isSelected={activeTemplateId === template.id}
                        onSelect={() => handleSelectTemplate(template.id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-[color:var(--page-line)] px-5 py-4 sm:px-6">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-[color:var(--page-line)] bg-white px-4 text-sm font-medium text-[color:var(--page-text)] transition hover:border-[color:var(--page-line-strong)]"
                    >
                      Close selection
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </DialogContent>
        ) : null}
      </Dialog>

      {showShortcuts && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(15,23,42,0.35)] p-4 sm:p-6">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-[color:var(--page-line)] bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-[color:var(--page-line)] px-6 py-4">
              <h2 className="text-lg font-semibold text-[color:var(--page-text)]">Keyboard Shortcuts</h2>
              <button
                type="button"
                onClick={() => setShowShortcuts(false)}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-[color:var(--page-line)] text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)]"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="flex flex-col gap-3">
                {[
                  { keys: "Ctrl + Z", action: "Undo" },
                  { keys: "Ctrl + Y", action: "Redo" },
                  { keys: "Ctrl + Shift + Z", action: "Redo" },
                  { keys: "Ctrl + P", action: "Print resume" },
                ].map((shortcut) => (
                  <div key={shortcut.keys} className="flex items-center justify-between rounded-lg bg-[color:var(--page-bg)] px-4 py-3">
                    <span className="text-sm text-[color:var(--page-text)]">{shortcut.action}</span>
                    <kbd className="rounded-md border border-[color:var(--page-line)] bg-white px-2 py-1 text-xs font-mono font-semibold text-[color:var(--page-muted)]">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-[color:var(--page-muted)]">Changes are auto-saved to your browser every 800ms.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
