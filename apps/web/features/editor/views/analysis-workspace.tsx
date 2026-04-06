import React, { useState } from "react";
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
} from "../../onboarding/components/wizard-icons";

interface AnalysisWorkspaceProps {
  targetRole: string;
  selectedTemplateId: ResumeTemplateVariant;
  resumeFileName: string;
  resumePreviewUrl?: string | null;
  analysisResult: ResumeAnalysisResult | null;
  initialForm?: ResumeForm;
  onBack: () => void;
  onTemplateChange?: (id: ResumeTemplateVariant) => void;
}

const workspaceSections = [
  { id: "personal", label: "Personal Info", icon: "personal", expanded: true },
  { id: "education", label: "Education", icon: "education", expanded: false },
  { id: "experience", label: "Work Experience", icon: "experience", expanded: false },
  { id: "leadership", label: "Leadership", icon: "leadership", expanded: false },
  { id: "awards", label: "Awards & Honors", icon: "awards", expanded: false },
] as const;

type ContentModalView = "content" | "project" | "templates" | null;

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
  resumePreviewUrl,
  analysisResult,
  initialForm,
  onBack,
  onTemplateChange,
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
    updateLeadership,
    addLeadership,
    removeLeadership,
    updateAwards,
    addAward,
    removeAward,
    addProject,
  } = useResumeEditor(initialForm);
  const [modalView, setModalView] = useState<ContentModalView>(null);
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>(emptyProjectDraft);
  const [projectFormError, setProjectFormError] = useState("");
  const [previewZoom, setPreviewZoom] = useState(100);

  const resumeTitle =
    form.personalInfo.fullName.trim() ||
    analysisResult?.extractedProfile?.fullName.trim() ||
    humanizeFileName(resumeFileName) ||
    "Uploaded Resume";
  const previewMode = resumePreviewUrl
    ? "uploaded"
    : analysisResult?.extractedProfile
      ? "structured"
      : analysisResult?.parsedResumeText
        ? "parsed"
        : "empty";
  const hasStructuredPreview = previewMode === "structured";
  const canZoomDocument = previewMode !== "uploaded";
  const feedbackSummary = {
    total: analysisResult?.suggestions.length ?? 0,
    critical: analysisResult?.suggestions.filter((suggestion) => suggestion.severity === "high")
      .length ?? 0,
    opportunity:
      analysisResult?.suggestions.filter((suggestion) => suggestion.category === "impact").length ??
      0,
  };

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
    onTemplateChange?.(templateId);
    setModalView(null);
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
          {editorSections.map((section, index) => (
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
            </div>
          ))}
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

  function handleDownloadSource() {
    if (!resumePreviewUrl) return;
    const anchor = document.createElement("a");
    anchor.href = resumePreviewUrl;
    anchor.download = resumeFileName;
    anchor.click();
  }

  function renderSuggestionCard(suggestion: ResumeAnalysisResult["suggestions"][number]) {
    const accentClass =
      suggestion.severity === "high"
        ? "border-rose-300 bg-rose-50/70"
        : suggestion.category === "impact"
          ? "border-amber-300 bg-amber-50/80"
          : "border-slate-200 bg-slate-50/80";
    const badgeClass =
      suggestion.severity === "high"
        ? "bg-rose-100 text-rose-700"
        : suggestion.category === "impact"
          ? "bg-amber-100 text-amber-700"
          : "bg-slate-100 text-slate-600";
    const badgeLabel =
      suggestion.severity === "high" ? "Critical" : suggestion.category === "impact" ? "Impact" : "Edit";

    return (
      <article
        key={suggestion.id}
        className={`rounded-[18px] border px-4 py-4 shadow-[0_10px_24px_rgba(26,32,61,0.05)] ${accentClass}`}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-[color:var(--page-text)]">{suggestion.title}</h3>
          <span
            className={`rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${badgeClass}`}
          >
            {badgeLabel}
          </span>
        </div>
        <p className="mt-2 text-sm leading-7 text-[color:var(--page-muted)]">{suggestion.detail}</p>
      </article>
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
          className="mx-auto aspect-[1/1.414] w-full max-w-[860px] overflow-hidden rounded-[28px] border border-[color:var(--page-line)] bg-white px-10 py-12 shadow-[0_24px_60px_rgba(26,32,61,0.12)] sm:px-14 sm:py-16"
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
          className="mx-auto aspect-[1/1.414] w-full max-w-[860px] overflow-hidden rounded-[28px] border border-[color:var(--page-line)] bg-white px-8 py-10 shadow-[0_24px_60px_rgba(26,32,61,0.12)] sm:px-12 sm:py-14 lg:px-16 lg:py-16"
          style={{
            transform: `scale(${previewZoom / 100})`,
            transformOrigin: "top center",
          }}
        >
          <ResumeRenderer form={form} variantId={selectedTemplateId} />
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

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-[color:var(--page-surface)] text-[color:var(--page-text)]">
      <header className="border-b border-[color:var(--page-line)] bg-white px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-[14px] border border-[color:var(--page-line)] bg-white px-4 py-2.5 text-sm font-medium text-[color:var(--page-muted)] transition hover:border-[color:var(--page-line-strong)] hover:text-[color:var(--page-text)]"
            >
              <ArrowLeftIcon />
              Back
            </button>
            <button
              type="button"
              onClick={() => setModalView("templates")}
              className="group inline-flex items-center gap-2 rounded-[14px] border border-transparent bg-slate-50/50 px-3 py-1 text-xl font-semibold text-[color:var(--page-text)] transition hover:bg-slate-100/80 active:scale-[0.98]"
            >
              {resumeTitle}
              <span className="text-[color:var(--page-muted)] opacity-0 transition group-hover:opacity-100">
                <ChevronDownIcon />
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-[14px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-2.5 text-sm text-[color:var(--page-muted)]">
              <span className="text-emerald-500">
                <ClockIcon />
              </span>
              Saved 426s ago
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[14px] bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(79,107,255,0.22)] transition hover:bg-[color:var(--brand-strong)]"
            >
              <EyeIcon />
              Tailor to Job
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[14px] border border-[color:var(--page-line)] bg-white px-4 py-2.5 text-sm font-medium text-[color:var(--page-text)] transition hover:border-[color:var(--page-line-strong)]"
            >
              <GridIcon />
              {humanizeFileName(resumeFileName)}
            </button>

            <button
              type="button"
              onClick={handleDownloadSource}
              disabled={!resumePreviewUrl}
              className="inline-flex items-center gap-2 rounded-[14px] border border-[color:var(--page-line)] bg-white px-5 py-2.5 text-sm font-semibold text-[color:var(--page-text)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[color:var(--page-line)] disabled:hover:text-[color:var(--page-text)]"
            >
              <DownloadIcon />
              {resumePreviewUrl ? "Download Source" : "Export PDF"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="w-[420px] shrink-0 border-r border-[color:var(--page-line)] bg-white">
          {renderEditor()}
        </aside>

        <section className="min-h-0 flex-1 overflow-hidden bg-[color:var(--page-bg-strong)]">
          <div className="grid h-full gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_22rem] xl:p-8">
            <div className="relative min-h-0 overflow-hidden rounded-[28px] border border-[color:var(--page-line)] bg-[linear-gradient(180deg,#f4f7fc_0%,#eef3fb_100%)]">
              <div className="pointer-events-none absolute left-1/2 top-5 z-20 -translate-x-1/2">
                <div className="pointer-events-auto inline-flex items-center gap-3 rounded-[16px] border border-[color:var(--page-line)] bg-white px-4 py-3 shadow-[0_14px_30px_rgba(26,32,61,0.1)]">
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
                    disabled={!resumePreviewUrl}
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
                    ? "Previewing the uploaded PDF directly."
                    : previewMode === "parsed"
                      ? "Showing a parser-based text preview because a direct file render is not available."
                      : "Showing a structured resume preview from the extracted content."}
                </div>
                {renderDocumentPreview()}
              </div>
            </div>

            <aside className="min-h-0 overflow-auto rounded-[28px] border border-[color:var(--page-line)] bg-white p-5 shadow-[0_18px_48px_rgba(26,32,61,0.08)]">
              <div className="flex items-start justify-between gap-4 border-b border-[color:var(--page-line)] pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
                    Target Role
                  </p>
                  <h2 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-[color:var(--page-text)]">
                    {targetRole}
                  </h2>
                  <p className="mt-2 text-sm text-[color:var(--page-muted)]">
                    {analysisResult?.extractionProvider === "openai"
                      ? "OpenAI structured extraction applied"
                      : "Parser-based preview mode"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSource}
                  disabled={!resumePreviewUrl}
                  className="inline-flex shrink-0 items-center gap-2 rounded-[14px] border border-[color:var(--page-line)] bg-white px-4 py-2.5 text-sm font-medium text-[color:var(--page-text)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <DownloadIcon />
                  Export PDF
                </button>
              </div>

              {analysisResult ? (
                <>
                  <div className="mt-5 rounded-[20px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
                      Match Score
                    </p>
                    <div className="mt-3 flex items-end gap-2">
                      <span className="text-5xl font-semibold tracking-tight text-[color:var(--page-text)]">
                        {analysisResult.score}
                      </span>
                      <span className="pb-1 text-xl text-[color:var(--page-muted)]">/100</span>
                    </div>
                    <div className="mt-4 h-3 rounded-full bg-[color:var(--page-line)]">
                      <div
                        className="h-full rounded-full bg-[color:var(--brand)] transition-all"
                        style={{ width: `${analysisResult.score}%` }}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-[color:var(--page-muted)]">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 border-b border-[color:var(--page-line)] pb-5 text-center">
                    <div className="rounded-[16px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--page-muted)]">
                        All
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[color:var(--page-text)]">
                        {feedbackSummary.total}
                      </p>
                    </div>
                    <div className="rounded-[16px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--page-muted)]">
                        Critical
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[color:var(--page-text)]">
                        {feedbackSummary.critical}
                      </p>
                    </div>
                    <div className="rounded-[16px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--page-muted)]">
                        Impact
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-[color:var(--page-text)]">
                        {feedbackSummary.opportunity}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
                      Matched
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {analysisResult.matchedKeywords.length > 0 ? (
                        analysisResult.matchedKeywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-full bg-[color:var(--brand-soft)] px-3 py-1.5 text-xs font-medium text-[color:var(--brand)]"
                          >
                            {keyword}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-[color:var(--page-muted)]">No keyword matches yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
                      Missing
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {analysisResult.missingKeywords.length > 0 ? (
                        analysisResult.missingKeywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-full border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-3 py-1.5 text-xs font-medium text-[color:var(--page-text)]"
                          >
                            {keyword}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-[color:var(--page-muted)]">No missing keywords detected.</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
                        Suggested Edits
                      </p>
                      {analysisResult.sourceFileName ? (
                        <span className="text-xs text-[color:var(--page-muted)]">
                          {analysisResult.sourceFileName}
                        </span>
                      ) : null}
                    </div>
                    {analysisResult.suggestions.length > 0 ? (
                      analysisResult.suggestions.map((suggestion) => renderSuggestionCard(suggestion))
                    ) : (
                      <div className="rounded-[18px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-4 py-4 text-sm text-[color:var(--page-muted)]">
                        No immediate edits suggested.
                      </div>
                    )}
                  </div>

                  <div className="mt-6 rounded-[18px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] p-4 text-sm text-[color:var(--page-muted)]">
                    <div className="flex items-center gap-2 font-medium text-[color:var(--page-text)]">
                      <ClockIcon />
                      Generated {new Date(analysisResult.generatedAt).toLocaleString()}
                    </div>
                    {analysisResult.extractedCharacterCount ? (
                      <p className="mt-2">
                        {analysisResult.extractedCharacterCount.toLocaleString()} characters extracted
                      </p>
                    ) : null}
                  </div>

                  {analysisResult.extractedProfile ? (
                    <div className="mt-6 rounded-[18px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
                        Extracted Snapshot
                      </p>
                      <p className="mt-3 text-base font-semibold text-[color:var(--page-text)]">
                        {analysisResult.extractedProfile.fullName || resumeTitle}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[color:var(--page-muted)]">
                        {analysisResult.extractedProfile.summary || "No summary extracted."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {analysisResult.extractedProfile.skills.slice(0, 8).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-[color:var(--page-line)] bg-white px-3 py-1.5 text-xs font-medium text-[color:var(--page-text)]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}
            </aside>
          </div>
        </section>
      </div>

      {modalView ? (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[rgba(15,23,42,0.35)] p-4 sm:p-6">
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
                  <div className="grid gap-5 lg:grid-cols-3">
                    {addContentOptions.map((option) =>
                      option.interactive ? (
                        <button
                          key={option.id}
                          type="button"
                          onClick={openProjectModal}
                          className="rounded-[24px] border border-[color:var(--page-line)] bg-[color:var(--page-surface)] p-6 text-left transition hover:border-[color:var(--brand)] hover:-translate-y-0.5"
                        >
                          <div className="flex items-start gap-5">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[22px] border border-[color:var(--page-line)] bg-white text-[color:var(--page-muted)]">
                              {contentOptionIcon(option.icon)}
                            </div>
                            <div className="space-y-2">
                              <p className="text-[2rem] font-semibold tracking-tight text-[color:var(--page-text)]">
                                {option.title}
                              </p>
                              <p className="max-w-[16rem] text-lg leading-9 text-[color:var(--page-muted)]">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ) : (
                        <div
                          key={option.id}
                          className="rounded-[24px] border border-[color:var(--page-line)] bg-[color:var(--page-surface)] p-6"
                        >
                          <div className="flex items-start gap-5">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[22px] border border-[color:var(--page-line)] bg-white text-[color:var(--page-muted)]">
                              {contentOptionIcon(option.icon)}
                            </div>
                            <div className="space-y-2">
                              <p className="text-[2rem] font-semibold tracking-tight text-[color:var(--page-text)]">
                                {option.title}
                              </p>
                              <p className="max-w-[16rem] text-lg leading-9 text-[color:var(--page-muted)]">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </div>
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
                        isSelected={selectedTemplateId === template.id}
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
    </div>
  );
}
