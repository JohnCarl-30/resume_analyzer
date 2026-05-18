import React, { useEffect, useState } from "react";
import type { ResumeAnalysisResult } from "../model/resume-analysis";
import type { ResumeForm } from "../model/resume-form";
import { sampleTemplates, type ResumeTemplateVariant } from "../../templates/model/template";
import { TemplateCard } from "../../templates/components/template-card";
import { useResumeEditor } from "../view-models/use-resume-editor";
import { PersonalInfoEditor } from "../components/editors/personal-info-editor";
import { ExperienceEditor } from "../components/editors/experience-editor";
import { EducationEditor } from "../components/editors/education-editor";
import { LeadershipEditor } from "../components/editors/leadership-editor";
import { AwardsEditor } from "../components/editors/awards-editor";
import { ResumeRenderer } from "../components/resume-renderer";
import { apiClient } from "../../../lib/api-instance";

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
  onBack: () => void;
  onTemplateChange?: (id: ResumeTemplateVariant) => void;
  onAnalysisUpdate?: (result: ResumeAnalysisResult) => void;
  onJobDescriptionChange?: (jd: string) => void;
  onRename?: (name: string) => void;
}

const workspaceSections = [
  { id: "personal", label: "Personal Info", icon: "personal", expanded: true },
  { id: "education", label: "Education", icon: "education", expanded: false },
  { id: "experience", label: "Work Experience", icon: "experience", expanded: false },
  { id: "leadership", label: "Leadership", icon: "leadership", expanded: false },
  { id: "awards", label: "Awards & Honors", icon: "awards", expanded: false },
] as const;

type ContentModalView = "content" | "project" | "templates" | "tailor" | null;

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
    description: "Professional certifications and licenses",
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

function humanizeFileName(fileName: string) {
  return fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  onBack,
  onTemplateChange,
  onAnalysisUpdate,
  onJobDescriptionChange,
  onRename,
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
  } = useResumeEditor(initialForm);
  const [activeTemplateId, setActiveTemplateId] = useState(selectedTemplateId);
  const [pendingModalClose, setPendingModalClose] = useState(false);
  const [modalView, setModalView] = useState<ContentModalView>(null);
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>(emptyProjectDraft);
  const [projectFormError, setProjectFormError] = useState("");
  const [previewZoom, setPreviewZoom] = useState(100);
  const [isUpdatingAnalysis, setIsUpdatingAnalysis] = useState(false);
  const [newJobDescription, setNewJobDescription] = useState(analysisResult?.jobDescription ?? "");
  const [updateError, setUpdateError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "error" | "success" } | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(resumeFileName);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [saveFlash, setSaveFlash] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
    "Uploaded Resume";
  const hasStructuredPreview = previewMode === "structured";
  const canZoomDocument = previewMode !== "uploaded";
  const lastSavedLabel = relativeTimeLabel(analysisResult?.generatedAt);
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
    const timeout = setTimeout(() => {
      setSaveFlash(true);
      setTimeout(() => setSaveFlash(false), 1200);
    }, 800);
    return () => clearTimeout(timeout);
  }, [form]);

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
    setActiveSectionId(sectionId);
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
      addLeadership();
      setActiveSectionId("leadership");
      closeModal();
      return;
    }
    if (optionId === "certifications" || optionId === "publications") {
      addAward();
      setActiveSectionId("awards");
      closeModal();
    }
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
      return (
        <LeadershipEditor
          entries={form.leadership}
          onAdd={addLeadership}
          onUpdate={updateLeadership}
          onRemove={removeLeadership}
          onBack={() => setActiveSectionId(null)}
        />
      );
    }
    if (activeSectionId === "awards") {
      return (
        <AwardsEditor
          entries={form.awards}
          onAdd={addAward}
          onUpdate={updateAwards}
          onRemove={removeAward}
          onBack={() => setActiveSectionId(null)}
        />
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-[color:var(--page-line)] px-6 py-5">
          <h2 className="text-2xl font-semibold tracking-tight text-[color:var(--page-text)]">
            Resume Sections
          </h2>
          <p className="mt-2 text-base text-[color:var(--page-muted)]">Click any section to edit</p>
          <div className="mt-4 rounded-[14px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-3 text-sm text-[color:var(--page-muted)]">
            Source: <span className="font-medium text-[color:var(--page-text)]">{resumeFileName}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
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
                className={`${index === 0 ? "" : "border-t border-[color:var(--page-line)]"} px-2 py-4`}
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
                      className="text-[1.05rem] font-medium text-[color:var(--page-text)] hover:text-[color:var(--brand)] transition"
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
                          onClick={() => handleSectionOpen(section.id)}
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
                  <div className="ml-11 mt-1 text-xs text-[color:var(--page-muted)] opacity-70">
                    {emptyHints[section.id]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="border-t border-[color:var(--page-line)] px-4 py-4 mt-auto">
          <button
            type="button"
            onClick={openAddContentModal}
            className="inline-flex w-full items-center justify-center gap-3 rounded-[14px] border border-[color:var(--page-line)] bg-[color:var(--page-surface)] px-4 py-3.5 text-lg font-medium text-[color:var(--page-text)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
          >
            <PlusIcon />
            Add Section
          </button>
        </div>
      </div>
    );
  }

  function adjustPreviewZoom(delta: number) {
    setPreviewZoom((currentZoom) => Math.max(70, Math.min(160, currentZoom + delta)));
  }

  function handleExportResume() {
    if (resumeSourceUrl) {
      const anchor = document.createElement("a");
      anchor.href = resumeSourceUrl;
      anchor.download = resumeFileName;
      anchor.click();
      return;
    }

    const fallback = new Blob([JSON.stringify(form, null, 2)], {
      type: "application/json",
    });
    const fallbackUrl = URL.createObjectURL(fallback);
    const anchor = document.createElement("a");
    anchor.href = fallbackUrl;
    anchor.download = `${humanizeFileName(resumeFileName) || "resume"}-export.json`;
    anchor.click();
    URL.revokeObjectURL(fallbackUrl);
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

  function SuggestionSidebar() {
    if (!showAnnotations || !analysisResult) return null;

    const severityStyles = {
      high: "border-rose-200 bg-rose-50/80 text-rose-800 hover:border-rose-300",
      medium: "border-amber-200 bg-amber-50/80 text-amber-800 hover:border-amber-300",
      low: "border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300",
    };

    const severityLabels = {
      high: "Critical",
      medium: "Impact",
      low: "Edit",
    };

    return (
      <div className="hidden lg:flex w-80 shrink-0 border-l border-[color:var(--page-line)] bg-white overflow-y-auto">
        <div className="border-b border-[color:var(--page-line)] px-4 py-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm text-[color:var(--page-text)]">Suggestions</h3>
            <button
              type="button"
              onClick={() => setShowAnnotations(false)}
              className="rounded-lg p-1 text-[color:var(--page-muted)] hover:bg-[color:var(--page-bg)] hover:text-[color:var(--page-text)]"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-700 font-medium">{analysisResult.suggestions.filter(s => s.severity === "high").length} Critical</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 font-medium">{analysisResult.suggestions.filter(s => s.severity === "medium").length} Impact</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 p-3">
          {analysisResult.suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              type="button"
              onClick={() => {
                if (suggestion.category === "keywords") setActiveSectionId("personal");
                else if (suggestion.title.toLowerCase().includes("summary")) setActiveSectionId("personal");
                else if (suggestion.title.toLowerCase().includes("experience")) setActiveSectionId("experience");
                else if (suggestion.title.toLowerCase().includes("education")) setActiveSectionId("education");
                else if (suggestion.title.toLowerCase().includes("bullet")) setActiveSectionId("experience");
                else setActiveSectionId("personal");
                setShowAnnotations(false);
              }}
              className={`rounded-[12px] border px-3 py-2.5 text-left text-xs transition shadow-sm ${severityStyles[suggestion.severity]}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{suggestion.title}</span>
                <span className="shrink-0 rounded-full bg-white/70 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider">
                  {severityLabels[suggestion.severity]}
                </span>
              </div>
              <p className="mt-1 leading-4 opacity-90">{suggestion.detail}</p>
              <span className="mt-2 inline-block text-[0.65rem] font-semibold text-[color:var(--brand)] opacity-70">Click to edit →</span>
            </button>
          ))}
          {analysisResult.missingKeywords.length > 0 && (
            <div className="rounded-[12px] border border-amber-200 bg-amber-50/60 px-3 py-2.5 text-xs shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-amber-800">Missing Keywords</span>
                <span className="shrink-0 rounded-full bg-white/70 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-amber-700">Keywords</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {analysisResult.missingKeywords.map((kw) => (
                  <span key={kw} className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[0.65rem] font-medium text-amber-700">{kw}</span>
                ))}
              </div>
            </div>
          )}
          {analysisResult.matchedKeywords.length > 0 && (
            <div className="rounded-[12px] border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-xs shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-semibold text-emerald-800">Matched Keywords</span>
                <span className="shrink-0 rounded-full bg-white/70 px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-emerald-700">Keywords</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {analysisResult.matchedKeywords.map((kw) => (
                  <span key={kw} className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[0.65rem] font-medium text-emerald-700">{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderDocumentPreview() {
    if (previewMode === "uploaded" && resumePreviewUrl) {
      return (
        <div className="mx-auto aspect-[1/1.414] w-full max-w-[860px] overflow-hidden rounded-[28px] border border-[color:var(--page-line)] bg-white shadow-[0_24px_60px_rgba(26,32,61,0.12)]">
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
          className="print-resume mx-auto aspect-[1/1.414] w-full max-w-[860px] overflow-hidden rounded-[28px] border border-[color:var(--page-line)] bg-white px-10 py-12 shadow-[0_24px_60px_rgba(26,32,61,0.12)] sm:px-14 sm:py-16"
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
          className="print-resume mx-auto aspect-[1/1.414] w-full max-w-[860px] overflow-hidden rounded-[28px] border border-[color:var(--page-line)] bg-white px-8 py-10 shadow-[0_24px_60px_rgba(26,32,61,0.12)] sm:px-12 sm:py-14 lg:px-16 lg:py-16"
          style={{
            transform: `scale(${previewZoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          <ResumeRenderer form={form} variantId={activeTemplateId} />
        </div>
      );
    }

    return (
      <div className="mx-auto flex aspect-[1/1.414] w-full max-w-[860px] items-center justify-center rounded-[28px] border border-dashed border-[color:var(--page-line)] bg-white px-8 py-10 text-center shadow-[0_24px_60px_rgba(26,32,61,0.08)]">
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
    <div className="relative flex h-full min-h-0 flex-1 flex-col bg-[color:var(--page-surface)] text-[color:var(--page-text)]">
      {isUpdatingAnalysis && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[color:var(--brand)] border-t-transparent"></div>
            <p className="text-lg font-medium text-[color:var(--page-text)]">Tailoring analysis to new job...</p>
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
      <header className="border-b border-[color:var(--page-line)] bg-white px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="inline-flex items-center justify-center rounded-[14px] border border-[color:var(--page-line)] bg-white px-3 py-2.5 text-[color:var(--page-text)] transition hover:bg-[color:var(--page-bg-soft)] xl:hidden"
              aria-label="Open editor menu"
            >
              <MenuIcon />
            </button>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-[14px] border border-[color:var(--page-line)] bg-white px-4 py-2.5 text-sm font-medium text-[color:var(--page-muted)] transition hover:border-[color:var(--page-line-strong)] hover:text-[color:var(--page-text)]"
            >
              <ArrowLeftIcon />
              Back
            </button>
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
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
                  className="rounded-[14px] border border-[color:var(--brand)] bg-white px-4 py-2 text-xl font-semibold text-[color:var(--page-text)] outline-none"
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
                className="group inline-flex items-center gap-2 rounded-[14px] border border-transparent bg-slate-50/50 px-3 py-1 text-xl font-semibold text-[color:var(--page-text)] transition hover:bg-slate-100/80 active:scale-[0.98]"
              >
                {resumeTitle}
                <span className="text-[color:var(--page-muted)] opacity-0 transition group-hover:opacity-100">
                  <PencilIcon />
                </span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!createMode && analysisResult && (
              <div className="inline-flex items-center gap-2 rounded-[14px] border border-[color:var(--page-line)] bg-white px-3 py-2">
                <ScoreRing score={analysisResult.score} size={40} />
                <div className="text-xs leading-tight">
                  <div className="font-bold text-[color:var(--page-text)]">{Math.round(analysisResult.score)}% Match</div>
                  <div className="text-[color:var(--page-muted)]">{analysisResult.matchedKeywords.length} keywords</div>
                </div>
              </div>
            )}

            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={undo}
                disabled={!canUndo}
                className="inline-flex items-center justify-center rounded-l-[14px] border border-[color:var(--page-line)] bg-white px-3 py-2.5 text-sm text-[color:var(--page-text)] transition hover:bg-[color:var(--page-bg-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Undo"
                title="Undo"
              >
                <UndoIcon />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!canRedo}
                className="inline-flex items-center justify-center rounded-r-[14px] border border-l-0 border-[color:var(--page-line)] bg-white px-3 py-2.5 text-sm text-[color:var(--page-text)] transition hover:bg-[color:var(--page-bg-soft)] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Redo"
                title="Redo"
              >
                <RedoIcon />
              </button>
            </div>
            <div className="inline-flex items-center gap-2 rounded-[14px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-2.5 text-sm text-[color:var(--page-muted)]">
              <span className={`transition-opacity duration-500 ${saveFlash ? "opacity-100" : "opacity-0"} text-emerald-500`}>
                <CheckCircleIcon />
              </span>
              <span className={`transition-opacity duration-500 ${saveFlash ? "opacity-0" : "opacity-100"}`}>
                <ClockIcon />
              </span>
              <span className={`transition-opacity duration-500 ${saveFlash ? "opacity-0" : "opacity-100"}`}>
                {lastSavedLabel}
              </span>
              <span className={`absolute transition-opacity duration-500 ${saveFlash ? "opacity-100" : "opacity-0"} text-emerald-600 font-medium`}>
                Saved
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowShortcuts(true)}
              className="inline-flex items-center justify-center rounded-[14px] border border-[color:var(--page-line)] bg-white px-3 py-2.5 text-sm text-[color:var(--page-text)] transition hover:bg-[color:var(--page-bg-soft)]"
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts"
            >
              <KeyboardIcon />
            </button>

            {!createMode && (
              <button
                type="button"
                onClick={openTailorModal}
                className="inline-flex items-center gap-2 rounded-[14px] bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(79,107,255,0.22)] transition hover:bg-[color:var(--brand-strong)]"
              >
                <EyeIcon />
                Tailor to Job
              </button>
            )}

            <button
              type="button"
              onClick={() => setModalView("templates")}
              aria-label="Switch template"
              className="group inline-flex items-center gap-2 rounded-[14px] border border-[color:var(--page-line)] bg-white px-4 py-2.5 text-sm font-medium text-[color:var(--page-text)] transition hover:border-[color:var(--page-line-strong)] hover:bg-[color:var(--page-bg-soft)] active:scale-[0.98]"
            >
              <GridIcon />
              {humanizeFileName(resumeFileName)}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-[14px] border border-[color:var(--page-line)] bg-white px-5 py-2.5 text-sm font-semibold text-[color:var(--page-text)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
            >
              <DownloadIcon />
              Print / PDF
            </button>

            {!createMode && (
              <button
                type="button"
                onClick={handleDownloadSource}
                disabled={!resumeSourceUrl}
                className="inline-flex items-center gap-2 rounded-[14px] border border-[color:var(--page-line)] bg-white px-5 py-2.5 text-sm font-semibold text-[color:var(--page-text)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[color:var(--page-line)] disabled:hover:text-[color:var(--page-text)]"
              >
                <DownloadIcon />
                {resumeSourceUrl ? "Download Source" : "Export JSON"}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm xl:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
        <aside className={`shrink-0 border-r border-[color:var(--page-line)] bg-white transition-transform duration-300 ease-in-out
          fixed inset-y-0 left-0 z-50 w-80 transform ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"} xl:static xl:z-auto xl:w-[420px] xl:transform-none xl:translate-x-0`}>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-[color:var(--page-line)] px-4 py-3 xl:hidden">
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

        <section className="min-h-0 flex flex-1 overflow-hidden bg-[color:var(--page-bg-strong)]">
          <div className="flex h-full flex-1 gap-0">
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-[28px] border border-[color:var(--page-line)] bg-[linear-gradient(180deg,#f4f7fc_0%,#eef3fb_100%)] m-2 sm:m-4 xl:m-8">
              <div className="pointer-events-none absolute left-1/2 top-5 z-20 -translate-x-1/2">
                <div className="pointer-events-auto inline-flex items-center gap-2 rounded-[16px] border border-[color:var(--page-line)] bg-white px-2.5 py-2.5 shadow-[0_14px_30px_rgba(26,32,61,0.1)]">
                  <div className="flex items-center gap-1 rounded-[12px] bg-slate-50 p-1">
                    {resumePreviewUrl && (
                      <button
                        type="button"
                        onClick={() => setPreviewMode("uploaded")}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-[9px] transition ${
                          previewMode === "uploaded"
                            ? "bg-white text-[color:var(--brand)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                            : "text-[color:var(--page-muted)] hover:text-[color:var(--page-text)]"
                        }`}
                      >
                        <FileIcon />
                        Original
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setPreviewMode("structured")}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-[9px] transition ${
                        previewMode === "structured"
                          ? "bg-white text-[color:var(--brand)] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                          : "text-[color:var(--page-muted)] hover:text-[color:var(--page-text)]"
                      }`}
                    >
                      <SparklesIcon />
                      AI Template
                    </button>
                  </div>

                  <div className="mx-1 h-8 w-px bg-[color:var(--page-line)]" />

                  {analysisResult && analysisResult.suggestions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAnnotations((s) => !s)}
                      className={`inline-flex items-center gap-2 rounded-[9px] px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                        showAnnotations
                          ? "bg-[color:var(--brand-soft)] text-[color:var(--brand)]"
                          : "text-[color:var(--page-muted)] hover:text-[color:var(--page-text)]"
                      }`}
                    >
                      <EyeIcon />
                      Suggestions
                    </button>
                  )}

                  <div className="mx-1 h-8 w-px bg-[color:var(--page-line)]" />

                  <button
                    type="button"
                    onClick={() => adjustPreviewZoom(-10)}
                    disabled={!canZoomDocument}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--page-line)] text-[color:var(--page-muted)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Zoom out"
                  >
                    <SearchIcon />
                  </button>
                  <span className="min-w-12 text-center text-sm font-semibold text-[color:var(--page-muted)]">
                    {previewZoom}%
                  </span>
                  <button
                    type="button"
                    onClick={() => adjustPreviewZoom(10)}
                    disabled={!canZoomDocument}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--page-line)] text-[color:var(--page-muted)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Zoom in"
                  >
                    <PlusIcon />
                  </button>
                  <div className="mx-1 h-8 w-px bg-[color:var(--page-line)]" />
                  <button
                    type="button"
                    onClick={handleDownloadSource}
                    disabled={!resumeSourceUrl}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--page-line)] text-[color:var(--page-muted)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Download source file"
                  >
                    <DownloadIcon />
                  </button>
                </div>
              </div>

              <div className="h-full overflow-auto px-5 pb-10 pt-24 sm:px-8">
                <div className="mx-auto mb-4 max-w-[860px] rounded-[18px] border border-[color:var(--page-line)] bg-white/75 px-4 py-3 text-center text-sm text-[color:var(--page-muted)] backdrop-blur-sm">
                  {previewMode === "uploaded"
                    ? "Viewing your original uploaded resume. Use the 'AI Template' toggle to see enhanced layouts."
                    : previewMode === "parsed"
                      ? "Showing a draft preview from the parsed text."
                      : "Previewing your content in the selected AI layout. Changes here reflect in your exported PDF."}
                </div>
                {renderDocumentPreview()}
              </div>
            </div>
            <SuggestionSidebar />
          </div>
        </section>
      </div>

      {modalView ? (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(15,23,42,0.35)] p-4 sm:p-6">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[28px] border border-[color:var(--page-line)] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
            {modalView === "content" ? (
              <>
                <div className="flex items-center justify-between border-b border-[color:var(--page-line)] px-6 py-5 sm:px-8">
                  <h2 className="text-[2rem] font-semibold tracking-tight text-[color:var(--page-text)]">
                    Add Content
                  </h2>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] border border-[color:var(--page-line)] bg-[color:var(--page-surface)] text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)]"
                    aria-label="Close add content"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <div className="px-6 py-6 sm:px-8 sm:py-8">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {addContentOptions.map((option) =>
                      option.interactive ? (
                        <button
                          key={option.id}
                          type="button"
                          onClick={openProjectModal}
                          className="rounded-[18px] border border-[color:var(--page-line)] bg-[color:var(--page-surface)] p-5 text-left transition hover:border-[color:var(--brand)] hover:-translate-y-0.5"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[color:var(--page-line)] bg-white text-[color:var(--page-muted)]">
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
                          className="rounded-[18px] border border-[color:var(--page-line)] bg-[color:var(--page-surface)] p-5 text-left transition hover:border-[color:var(--brand)] hover:-translate-y-0.5"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[color:var(--page-line)] bg-white text-[color:var(--page-muted)]">
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
                <div className="flex items-center justify-between border-b border-[color:var(--page-line)] px-6 py-5 sm:px-8">
                  <h2 className="text-[2rem] font-semibold tracking-tight text-[color:var(--page-text)]">
                    Add Projects
                  </h2>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] border border-[color:var(--page-line)] bg-[color:var(--page-surface)] text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)]"
                    aria-label="Close add projects"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <div className="max-h-[calc(92vh-5.5rem)] overflow-y-auto px-6 py-8 sm:px-8">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        value={projectDraft.name}
                        onChange={(event) => updateProjectDraft("name", event.target.value)}
                        placeholder="E-Commerce Platform"
                        className="w-full rounded-[18px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-6 py-4 text-2xl text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)]"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                        Technologies
                      </label>
                      <input
                        type="text"
                        value={projectDraft.technologies}
                        onChange={(event) => updateProjectDraft("technologies", event.target.value)}
                        placeholder="React, Node.js, PostgreSQL"
                        className="w-full rounded-[18px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-6 py-4 text-xl text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)]"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                        Project Link <span className="text-[color:var(--page-muted)]">(Optional)</span>
                      </label>
                      <input
                        type="url"
                        value={projectDraft.link}
                        onChange={(event) => updateProjectDraft("link", event.target.value)}
                        placeholder="https://github.com/username/project"
                        className="w-full rounded-[18px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-6 py-4 text-xl text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)]"
                      />
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-3">
                        <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                          Start Date
                        </label>
                        <div className="flex items-center justify-between rounded-[18px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-6 py-4">
                          <input
                            type="text"
                            value={projectDraft.startDate}
                            onChange={(event) => updateProjectDraft("startDate", event.target.value)}
                            placeholder="January 2024"
                            className="w-full bg-transparent text-xl text-[color:var(--page-text)] outline-none placeholder:text-[color:var(--page-muted)]"
                          />
                          <span className="ml-4 text-[color:var(--page-muted)]">
                            <CalendarIcon />
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                          End Date
                        </label>
                        <div className="flex items-center justify-between rounded-[18px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-6 py-4">
                          <input
                            type="text"
                            value={projectDraft.endDate}
                            onChange={(event) => updateProjectDraft("endDate", event.target.value)}
                            placeholder="March 2024"
                            disabled={projectDraft.current}
                            className="w-full bg-transparent text-xl text-[color:var(--page-text)] outline-none placeholder:text-[color:var(--page-muted)] disabled:opacity-50"
                          />
                          <span className="ml-4 text-[color:var(--page-muted)]">
                            <CalendarIcon />
                          </span>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-center gap-4 text-xl text-[color:var(--page-text)]">
                      <input
                        type="checkbox"
                        checked={projectDraft.current}
                        onChange={(event) => updateProjectDraft("current", event.target.checked)}
                        className="h-7 w-7 rounded border border-[color:var(--page-line)]"
                      />
                      Currently working on this project
                    </label>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-4">
                        <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                          Project Description
                        </label>
                        <button
                          type="button"
                          onClick={handleAddBullet}
                          className="inline-flex items-center gap-3 rounded-[16px] border border-[color:var(--page-line)] bg-white px-5 py-3 text-lg font-medium text-[color:var(--page-text)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                        >
                          <PlusIcon />
                          Add Bullet
                        </button>
                      </div>

                      <div className="flex items-center gap-6 text-3xl text-[color:var(--page-muted)]">
                        <span className="font-semibold text-[color:var(--brand)]">B</span>
                        <span className="italic text-sky-500">I</span>
                      </div>

                      {projectDraft.bullets.length > 0 ? (
                        <div className="space-y-2">
                          {projectDraft.bullets.map((bullet, index) => (
                            <div
                              key={`${bullet}-${index}`}
                              className="flex items-start justify-between gap-3 rounded-[16px] border border-[color:var(--page-line)] bg-[color:var(--page-surface)] px-4 py-3"
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

                      <div className="rounded-[20px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] p-5">
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
                          className="mt-3 min-h-[9rem] w-full resize-none bg-transparent text-2xl leading-9 text-[color:var(--page-text)] outline-none placeholder:text-[color:var(--page-muted)]"
                        />

                        <div className="mt-5 flex flex-col gap-4 border-t border-[color:var(--page-line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-base text-[color:var(--page-muted)]">
                            {Math.max(0, maxProjectBullets - projectDraft.bullets.length)} left
                          </p>
                          <button
                            type="button"
                            onClick={handleCompleteBullet}
                            className="inline-flex items-center gap-3 rounded-[18px] border border-[color:var(--page-line)] bg-white px-5 py-3 text-lg font-semibold text-[color:var(--brand)] transition hover:border-[color:var(--brand)]"
                          >
                            <SparklesIcon />
                            Complete Bullet
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-[color:var(--page-line)] px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                  <div className="min-h-6 text-sm text-rose-500">{projectFormError}</div>
                  <div className="flex items-center justify-end gap-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="inline-flex items-center justify-center rounded-[16px] border border-[color:var(--page-line)] bg-white px-8 py-4 text-2xl font-medium text-[color:var(--page-text)] transition hover:border-[color:var(--page-line-strong)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProject}
                      className="inline-flex items-center justify-center rounded-[16px] bg-[color:var(--brand)] px-8 py-4 text-2xl font-semibold text-white transition hover:bg-[color:var(--brand-strong)]"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </>
            ) : modalView === "tailor" ? (
              <>
                <div className="flex items-center justify-between border-b border-[color:var(--page-line)] px-6 py-5 sm:px-8">
                  <div className="space-y-1">
                    <h2 className="text-[2rem] font-semibold tracking-tight text-[color:var(--page-text)]">
                      Tailor to Job
                    </h2>
                    <p className="text-lg text-[color:var(--page-muted)]">
                      Paste a specific job description to re-calculate your match score.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-[16px] border border-[color:var(--page-line)] bg-[color:var(--page-surface)] text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)]"
                    aria-label="Close tailor modal"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <div className="px-6 py-8 sm:px-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold tracking-wide text-[color:var(--page-text)]">
                          Job Description
                        </label>
                        <span className="text-xs text-[color:var(--page-muted)]">
                          {newJobDescription.trim().length} characters
                        </span>
                      </div>
                      <textarea
                        value={newJobDescription}
                        onChange={(e) => setNewJobDescription(e.target.value)}
                        placeholder="Paste the full job description here..."
                        className="min-h-[400px] w-full resize-none rounded-[24px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-6 py-5 text-lg leading-8 text-[color:var(--page-text)] outline-none transition focus:border-[color:var(--brand)]"
                      />
                      {newJobDescription.length < 30 && newJobDescription.length > 0 && (
                        <p className="text-xs text-[#e16f62]">
                          Paste at least 30 characters from the job description.
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
                          aria-label="Retry analysis"
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
                        className="inline-flex h-16 items-center justify-center rounded-[18px] border border-[color:var(--page-line)] bg-white px-10 text-lg font-semibold text-[color:var(--page-text)] transition hover:bg-[color:var(--page-bg-strong)] disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isUpdatingAnalysis || newJobDescription.length < 30}
                        onClick={handleTailorToJob}
                        className="inline-flex h-16 items-center justify-center gap-3 rounded-[18px] bg-[color:var(--brand)] px-10 text-lg font-semibold text-white shadow-[0_12px_32px_rgba(37,99,235,0.25)] transition hover:bg-[color:var(--brand-strong)] hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
                      >
                        {isUpdatingAnalysis ? "Analyzing..." : "Update Analysis"}
                        {!isUpdatingAnalysis && <SparklesIcon />}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : modalView === "templates" ? (
              <div className="flex h-full flex-col">
                <header className="flex h-[112px] shrink-0 items-center justify-between border-b border-[color:var(--page-line)] px-8 sm:px-12">
                  <div className="space-y-1">
                    <h2 className="text-4xl font-semibold tracking-tight text-[color:var(--page-text)]">
                      Switch Template
                    </h2>
                    <p className="text-xl text-[color:var(--page-muted)]">Instant layout preview with your content</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="group flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--page-line)] bg-white transition hover:border-[color:var(--page-line-strong)] hover:bg-[color:var(--page-bg-strong)] active:scale-95"
                    aria-label="Close modal"
                  >
                    <CloseIcon />
                  </button>
                </header>

                <div className="flex-1 overflow-y-auto px-8 py-10 sm:px-12">
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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

                <div className="border-t border-[color:var(--page-line)] px-8 py-6 sm:px-12">
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="inline-flex h-16 items-center justify-center rounded-[20px] border border-[color:var(--page-line)] bg-white px-10 text-2xl font-medium text-[color:var(--page-text)] transition hover:border-[color:var(--page-line-strong)]"
                    >
                      Close selection
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {showShortcuts && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[rgba(15,23,42,0.35)] p-4 sm:p-6">
          <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-[color:var(--page-line)] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between border-b border-[color:var(--page-line)] px-6 py-4">
              <h2 className="text-lg font-semibold text-[color:var(--page-text)]">Keyboard Shortcuts</h2>
              <button
                type="button"
                onClick={() => setShowShortcuts(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-[color:var(--page-line)] text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)]"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-3">
                {[
                  { keys: "Ctrl + Z", action: "Undo" },
                  { keys: "Ctrl + Y", action: "Redo" },
                  { keys: "Ctrl + Shift + Z", action: "Redo" },
                  { keys: "Ctrl + P", action: "Print / PDF" },
                ].map((shortcut) => (
                  <div key={shortcut.keys} className="flex items-center justify-between rounded-[12px] bg-[color:var(--page-bg)] px-4 py-3">
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
