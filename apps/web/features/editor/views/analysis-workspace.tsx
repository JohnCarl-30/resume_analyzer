import React, { useState } from "react";
import type { ResumeAnalysisResult } from "../model/resume-analysis";
import type { ResumeForm } from "../model/resume-form";
import type { ResumeTemplateVariant } from "../../templates/model/template";
import { useResumeEditor } from "../view-models/use-resume-editor";
import { PersonalInfoEditor } from "../components/editors/personal-info-editor";
import { ExperienceEditor } from "../components/editors/experience-editor";
import { EducationEditor } from "../components/editors/education-editor";
import { LeadershipEditor } from "../components/editors/leadership-editor";
import { AwardsEditor } from "../components/editors/awards-editor";
import { ResumeRenderer } from "../components/resume-renderer";

import {
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
  analysisResult: ResumeAnalysisResult | null;
  initialForm?: ResumeForm;
  onBack: () => void;
}

const workspaceSections = [
  { id: "personal", label: "Personal Info", icon: "personal", expanded: true },
  { id: "education", label: "Education", icon: "education", expanded: false },
  { id: "experience", label: "Work Experience", icon: "experience", expanded: false },
  { id: "leadership", label: "Leadership", icon: "leadership", expanded: false },
  { id: "awards", label: "Awards & Honors", icon: "awards", expanded: false },
] as const;

type ContentModalView = "content" | "project" | null;

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

export function AnalysisWorkspace({
  targetRole,
  selectedTemplateId,
  resumeFileName,
  analysisResult,
  initialForm,
  onBack,
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
    removeProject,
  } = useResumeEditor(initialForm);
  const [modalView, setModalView] = useState<ContentModalView>(null);
  const [projectDraft, setProjectDraft] = useState<ProjectDraft>(emptyProjectDraft);
  const [projectFormError, setProjectFormError] = useState("");

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
    if (icon === "personal") {
      return <UserCircleIcon />;
    }
    if (icon === "education") {
      return <GraduationCapIcon />;
    }
    if (icon === "experience") {
      return <BriefcaseOutlineIcon />;
    }
    if (icon === "leadership") {
      return <UsersIcon />;
    }
    if (icon === "awards") {
      return <TrophyIcon />;
    }
    if (icon === "projects") {
      return <CodeBracketsIcon />;
    }
    return <SparklesIcon />;
  }

  function contentOptionIcon(icon: ContentOption["icon"]) {
    if (icon === "file") {
      return <FileIcon />;
    }
    if (icon === "target") {
      return <TargetIcon />;
    }
    if (icon === "projects") {
      return <CodeBracketsIcon />;
    }
    if (icon === "research") {
      return <ResearchIcon />;
    }
    if (icon === "badge") {
      return <BadgeIcon />;
    }
    if (icon === "book") {
      return <BookOpenIcon />;
    }
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

    if (!nextBullet || projectDraft.bullets.length >= maxProjectBullets) {
      return;
    }

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
            Source:{" "}
            <span className="font-medium text-[color:var(--page-text)]">{resumeFileName}</span>
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

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-[color:var(--page-surface)] text-[color:var(--page-text)]">
      <header className="border-b border-[color:var(--page-line)] bg-white px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="inline-flex items-center gap-2 text-xl font-semibold text-[color:var(--page-text)]">
              Untitled Resume
              <span className="text-[color:var(--page-muted)]">
                <PencilIcon />
              </span>
            </div>
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
              {form.personalInfo.fullName.split(" ")[0]} {form.personalInfo.fullName.split(" ")[1] || ""}
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-[14px] border border-[color:var(--page-line)] bg-white px-5 py-2.5 text-sm font-semibold text-[color:var(--page-text)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
            >
              <DownloadIcon />
              Download PDF
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="w-[420px] shrink-0 border-r border-[color:var(--page-line)] bg-white">
          {renderEditor()}
        </aside>

        <section className="flex-1 overflow-y-auto bg-[color:var(--page-bg-strong)] p-6 sm:p-8 lg:p-12">
          {analysisResult ? (
            <div className="mx-auto mb-6 grid w-full max-w-5xl gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
              <div className="rounded-[18px] border border-[color:var(--page-line)] bg-white p-5 shadow-[0_10px_24px_rgba(26,32,61,0.06)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
                  Match Score
                </p>
                <p className="mt-3 text-5xl font-semibold tracking-tight text-[color:var(--page-text)]">
                  {analysisResult.score}
                </p>
                  <p className="mt-2 text-sm text-[color:var(--page-muted)]">
                    Targeting {analysisResult.targetRole}
                  </p>
                  {analysisResult.extractionProvider === "openai" ? (
                    <p className="mt-2 text-sm font-medium text-[color:var(--brand)]">
                      OpenAI structured extraction applied
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-[color:var(--page-muted)]">
                      Parser-only mode
                    </p>
                  )}
                  {analysisResult.sourceFileName ? (
                    <p className="mt-2 text-sm text-[color:var(--page-muted)]">
                      Parsed from {analysisResult.sourceFileName}
                  </p>
                ) : null}
                <p className="mt-5 text-xs text-[color:var(--page-muted)]">
                  Generated {new Date(analysisResult.generatedAt).toLocaleString()}
                </p>
                {analysisResult.extractedCharacterCount ? (
                  <p className="mt-1 text-xs text-[color:var(--page-muted)]">
                    {analysisResult.extractedCharacterCount.toLocaleString()} characters extracted
                  </p>
                ) : null}
              </div>

              <div className="rounded-[18px] border border-[color:var(--page-line)] bg-white p-5 shadow-[0_10px_24px_rgba(26,32,61,0.06)]">
                <div className="grid gap-5 lg:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
                      Matched
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {analysisResult.matchedKeywords.length > 0 ? (
                        analysisResult.matchedKeywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-full bg-[color:var(--brand-soft)] px-3 py-1 text-xs font-medium text-[color:var(--brand)]"
                          >
                            {keyword}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-[color:var(--page-muted)]">No keyword matches yet.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
                      Missing
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {analysisResult.missingKeywords.length > 0 ? (
                        analysisResult.missingKeywords.map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded-full border border-[color:var(--page-line)] bg-[color:var(--page-bg)] px-3 py-1 text-xs font-medium text-[color:var(--page-text)]"
                          >
                            {keyword}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-[color:var(--page-muted)]">No missing keywords detected.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
                      Suggested Edits
                    </p>
                    <div className="mt-3 space-y-3">
                      {analysisResult.suggestions.length > 0 ? (
                        analysisResult.suggestions.map((suggestion) => (
                          <div key={suggestion.id} className="rounded-[14px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] p-3">
                            <p className="text-sm font-semibold text-[color:var(--page-text)]">
                              {suggestion.title}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-[color:var(--page-muted)]">
                              {suggestion.detail}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-[color:var(--page-muted)]">No immediate edits suggested.</p>
                      )}
                    </div>
                  </div>

                  {analysisResult.extractedProfile ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
                        Extracted Snapshot
                      </p>
                      <div className="mt-3 rounded-[14px] border border-[color:var(--page-line)] bg-[color:var(--page-bg)] p-3">
                        <p className="text-sm font-semibold text-[color:var(--page-text)]">
                          {analysisResult.extractedProfile.fullName || "Unnamed Candidate"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-[color:var(--page-muted)]">
                          {analysisResult.extractedProfile.summary || "No summary extracted."}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {analysisResult.extractedProfile.skills.slice(0, 6).map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[color:var(--page-text)]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <div className="mx-auto aspect-[1/1.414] w-full max-w-5xl bg-white shadow-[var(--shadow-md)] px-8 py-10 sm:px-12 sm:py-14 lg:px-16 lg:py-16">
            <ResumeRenderer form={form} variantId={selectedTemplateId} />
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
            ) : (
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
                              <p className="text-base leading-7 text-[color:var(--page-text)]">
                                {bullet}
                              </p>
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
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
