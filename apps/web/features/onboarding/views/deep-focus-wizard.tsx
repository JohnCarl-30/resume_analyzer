"use client";

import type { ChangeEvent, DragEvent } from "react";
import { useId, useRef, useState } from "react";

import { sampleTemplates } from "@/features/templates/model/template";
import { useResumeEditor } from "../../editor/view-models/use-resume-editor";
import { PersonalInfoEditor } from "../../editor/components/editors/personal-info-editor";
import { ExperienceEditor } from "../../editor/components/editors/experience-editor";
import { EducationEditor } from "../../editor/components/editors/education-editor";
import { LeadershipEditor } from "../../editor/components/editors/leadership-editor";
import { AwardsEditor } from "../../editor/components/editors/awards-editor";

type WizardStep = 1 | 2 | 3;
type ViewMode = "wizard" | "workspace";

const maxFileSize = 10 * 1024 * 1024;
const supportedExtensions = [".pdf", ".doc", ".docx"];
const workspaceSections = [
  { id: "personal", label: "Personal Info", icon: "personal" as const, expanded: false },
  { id: "education", label: "Education", icon: "education" as const, expanded: true },
  { id: "experience", label: "Experience", icon: "experience" as const, expanded: true },
  { id: "leadership", label: "Leadership", icon: "leadership" as const, expanded: true },
  { id: "awards", label: "Awards", icon: "awards" as const, expanded: true },
  { id: "skills", label: "Skills", icon: "skills" as const, expanded: true },
] as const;

function formatFileSize(size: number) {
  return `${(size / 1024 / 1024).toFixed(size >= 1024 * 1024 ? 1 : 2)} MB`;
}

function isSupportedFile(file: File) {
  const normalizedName = file.name.toLowerCase();

  return supportedExtensions.some((extension) => normalizedName.endsWith(extension));
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M11.75 4.25L6 10l5.75 5.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M8.25 4.25L14 10l-5.75 5.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M7 5.75V4.5A1.5 1.5 0 018.5 3h3A1.5 1.5 0 0113 4.5v1.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect
        x="3"
        y="5.75"
        width="14"
        height="10.75"
        rx="2.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-5 w-5">
      <path
        d="M10 13.5V6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 8.5L10 6l2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.75 13.25v1A1.75 1.75 0 006.5 16h7a1.75 1.75 0 001.75-1.75v-1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M5 10.25l3.2 3.2L15 6.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-5 w-5">
      <path
        d="M2.5 10c1.7-3.2 4.4-4.8 7.5-4.8 3.1 0 5.8 1.6 7.5 4.8-1.7 3.2-4.4 4.8-7.5 4.8-3.1 0-5.8-1.6-7.5-4.8z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="10" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-5 w-5">
      <rect x="3" y="3" width="5.5" height="5.5" rx="1" fill="currentColor" />
      <rect x="11.5" y="3" width="5.5" height="5.5" rx="1" fill="currentColor" />
      <rect x="3" y="11.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
      <rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1" fill="currentColor" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-5 w-5">
      <path
        d="M6 2.75h5.5L15.75 7v10.25a1 1 0 01-1 1H6a1 1 0 01-1-1v-13.5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M11.5 2.75V7h4.25" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function PanelsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-5 w-5">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 3v14M3 10h14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-5 w-5">
      <path
        d="M10 5.75a4.25 4.25 0 100 8.5 4.25 4.25 0 000-8.5z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M10 2.5v1.75M10 15.75V17.5M17.5 10h-1.75M4.25 10H2.5M15.3 4.7l-1.25 1.25M5.95 14.05L4.7 15.3M15.3 15.3l-1.25-1.25M5.95 5.95L4.7 4.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
      <circle cx="8.5" cy="8.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 12l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
      <path d="M10 3.5v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 8.75L10 11.75l3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4.5 14.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M4 13.75L13.85 3.9a1.6 1.6 0 112.25 2.25L6.25 16H4v-2.25z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
      <circle cx="10" cy="10" r="6.75" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 6.6v3.8l2.5 1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
      <path d="M10 4.25v11.5M4.25 10h11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
      <path d="M5.5 7.75L10 12.25l4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-4 w-4">
      <path d="M7.75 5.5L12.25 10l-4.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserCircleIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-5 w-5">
      <circle cx="10" cy="6.6" r="2.3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.2 15.4a5.5 5.5 0 019.6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GraduationCapIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-5 w-5">
      <path d="M2.5 8.2L10 4.7l7.5 3.5L10 11.7 2.5 8.2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M5.5 9.6v2.6c0 .9 2 1.9 4.5 1.9s4.5-1 4.5-1.9V9.6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function BriefcaseOutlineIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-5 w-5">
      <path d="M7 5.5V4.4A1.4 1.4 0 018.4 3h3.2A1.4 1.4 0 0113 4.4v1.1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="5.5" width="14" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-5 w-5">
      <circle cx="7" cy="7.3" r="2.1" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="13.2" cy="6.7" r="1.8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.7 15.4a4 4 0 016.6 0M10.7 14.5a3.4 3.4 0 015.3 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-5 w-5">
      <path d="M6 4h8v2.7A4 4 0 0110 10.7 4 4 0 016 6.7V4z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.2 10.5v2.1L6.6 15h6.8l-1.6-2.4v-2.1" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M6 5H4.5A1.5 1.5 0 003 6.5 2.8 2.8 0 005.8 9H6M14 5h1.5A1.5 1.5 0 0117 6.5 2.8 2.8 0 0114.2 9H14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden className="h-5 w-5">
      <path d="M10 3.2l1.4 3.4 3.4 1.4-3.4 1.4L10 13l-1.4-3.6L5.2 8l3.4-1.4L10 3.2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M15.6 13.2l.7 1.8 1.9.7-1.9.8-.7 1.8-.8-1.8-1.8-.8 1.8-.7.8-1.8z" fill="currentColor" />
    </svg>
  );
}

function BrandMark() {
  return (
    <div className="flex h-5 w-5 items-end gap-[2px] text-[color:var(--page-text)]" aria-hidden>
      <span className="h-2.5 w-1.5 rounded-sm bg-current" />
      <span className="h-3.5 w-1.5 rounded-sm bg-current" />
      <span className="h-5 w-1.5 rounded-sm bg-current" />
    </div>
  );
}

function AnalysisWorkspace({
  targetRole,
  selectedTemplateName,
  resumeFileName,
  onBack,
}: {
  targetRole: string;
  selectedTemplateName: string;
  resumeFileName: string;
  onBack: () => void;
}) {
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
  } = useResumeEditor();

  function sectionIcon(icon: (typeof workspaceSections)[number]["icon"]) {
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

    return <SparklesIcon />;
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
            Template:{" "}
            <span className="font-medium text-[color:var(--page-text)]">
              {selectedTemplateName}
            </span>
            <br />
            Source:{" "}
            <span className="font-medium text-[color:var(--page-text)]">{resumeFileName}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {workspaceSections.map((section, index) => (
            <div
              key={section.id}
              className={`${index === 0 ? "" : "border-t border-[color:var(--page-line)]"} px-2 py-4`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSectionId(section.id)}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-full text-[color:var(--page-muted)] transition hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--brand)]"
                    aria-label={section.expanded ? "Collapse section" : "Expand section"}
                  >
                    {section.expanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                  </button>
                  <span className="text-[color:var(--page-muted)]">{sectionIcon(section.icon)}</span>
                  <button
                    type="button"
                    onClick={() => setActiveSectionId(section.id)}
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
                        onClick={() => setActiveSectionId(section.id)}
                        className="text-[color:var(--brand)] transition hover:text-[color:var(--brand-strong)]"
                        aria-label="Add item"
                      >
                        <PlusIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSectionId(section.id)}
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
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)]"
            >
              <ArrowLeftIcon />
              Back
            </button>
            <span className="hidden h-6 w-px bg-[color:var(--page-line)] sm:block" />
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

      <div className="grid min-h-0 flex-1 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <aside className="border-b border-[color:var(--page-line)] bg-[#f8faff] lg:border-b-0 lg:border-r">
          <div className="h-full rounded-none border-none bg-white shadow-none lg:rounded-[22px] lg:m-4 lg:border lg:border-[color:var(--page-line)] lg:shadow-[0_14px_34px_rgba(59,75,138,0.08)] overflow-hidden">
            {renderEditor()}
          </div>
        </aside>

        <section className="min-h-0 bg-[#f3f6ff] p-4 lg:p-5">
          <div className="flex h-full flex-col overflow-hidden rounded-[24px] border border-[color:var(--page-line)] bg-white shadow-[0_20px_44px_rgba(59,75,138,0.1)]">
            <div className="border-b border-[color:var(--page-line)] bg-[#f7f9ff] px-5 py-3 text-center text-sm font-medium text-[color:var(--page-muted)]">
              Preview is approximate. Download PDF for exact layout.
            </div>

            <div className="flex-1 overflow-auto bg-[#edf2ff] p-3 sm:p-5">
              <div className="mx-auto w-full max-w-[72rem] rounded-[18px] bg-white px-6 py-8 text-[#161616] shadow-[0_20px_40px_rgba(0,0,0,0.18)] sm:px-10">
                <header className="border-b border-black pb-4 text-center">
                  <h1 className="font-serif text-[2.2rem] font-bold tracking-tight sm:text-[3rem]">
                    {form.personalInfo.fullName}
                  </h1>
                  <p className="mt-2 text-base text-[#303030]">
                    {form.personalInfo.phone} | {form.personalInfo.email}
                  </p>
                </header>

                <div className="space-y-10 pt-8 font-serif text-[1.05rem] leading-8">
                  {form.education.length > 0 && (
                    <section>
                      <div className="border-b border-black pb-2">
                        <h2 className="text-[1.2rem]">Education</h2>
                      </div>

                      <div className="space-y-4 pt-4">
                        {form.education.map((edu) => (
                          <div key={edu.id} className="grid grid-cols-[minmax(0,1fr)_15rem] gap-4">
                            <div>
                              <p className="font-bold">{edu.institution}</p>
                              <p className="italic">{edu.degree}</p>
                            </div>
                            <div className="text-right">
                              <p>{edu.location}</p>
                              <p className="italic">{edu.dateRange}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {form.experience.length > 0 && (
                    <section>
                      <div className="border-b border-black pb-2">
                        <h2 className="text-[1.2rem]">Experience</h2>
                      </div>
                      <div className="space-y-6 pt-4">
                        {form.experience.map((exp) => (
                          <div key={exp.id}>
                            <div className="grid grid-cols-[minmax(0,1fr)_15rem] gap-4">
                              <div>
                                <p className="font-bold">{exp.role}</p>
                              </div>
                              <div className="text-right">
                                <p className="italic">{exp.dateRange}</p>
                              </div>
                            </div>
                            <p className="text-right">{exp.location}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {form.leadership.length > 0 && (
                    <section>
                      <div className="border-b border-black pb-2">
                        <h2 className="text-[1.2rem]">Leadership Experience</h2>
                      </div>
                      <div className="space-y-4 pt-4">
                        {form.leadership.map((item) => (
                          <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_15rem] gap-4">
                            <div>
                              <p className="font-bold">{item.role}</p>
                              <p className="italic">{item.organization}</p>
                            </div>
                            <div className="text-right">
                              <p className="italic">{item.dateRange}</p>
                              <p>{item.location}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {form.awards.length > 0 && (
                    <section>
                      <div className="border-b border-black pb-2">
                        <h2 className="text-[1.2rem]">Awards &amp; Honors</h2>
                      </div>
                      <div className="pt-4">
                        <ul className="list-disc pl-5">
                          {form.awards.map((award, i) => (
                            <li key={i}>{award}</li>
                          ))}
                        </ul>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function TemplatePreview({ variant }: { variant: (typeof sampleTemplates)[number]["previewVariant"] }) {
  if (variant === "minimalist-grid") {
    return (
      <div className="relative h-full w-full rounded-[12px] bg-[#f7f9fc] p-3 shadow-[0_18px_34px_rgba(34,55,102,0.16)]">
        <div className="absolute -left-3 top-4 h-10 w-10 rounded-full border border-white/60 bg-[#d9e0ea]" />
        <div className="grid h-full grid-cols-[0.42fr_0.58fr] gap-3">
          <div className="space-y-2 rounded-[10px] bg-[#e8edf5] p-2.5">
            <div className="h-6 w-6 rounded-full bg-[#8797ab]" />
            <div className="h-1.5 w-4/5 rounded-full bg-[#9daabc]" />
            <div className="h-1.5 w-full rounded-full bg-[#bac4d2]" />
            <div className="h-1.5 w-3/4 rounded-full bg-[#bac4d2]" />
          </div>
          <div className="space-y-2 pt-1">
            <div className="h-2 w-2/3 rounded-full bg-[#8a95ac]" />
            <div className="h-1.5 w-full rounded-full bg-[#d0d8e5]" />
            <div className="h-1.5 w-5/6 rounded-full bg-[#d0d8e5]" />
            <div className="mt-4 h-2 w-1/2 rounded-full bg-[#8a95ac]" />
            <div className="h-1.5 w-full rounded-full bg-[#d0d8e5]" />
            <div className="h-1.5 w-4/5 rounded-full bg-[#d0d8e5]" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "executive-clean") {
    return (
      <div className="h-full w-full rounded-[12px] bg-[#dae6e8] p-3 shadow-[0_18px_34px_rgba(34,55,102,0.15)]">
        <div className="grid h-full grid-cols-[0.48fr_0.52fr] overflow-hidden rounded-[10px] bg-white">
          <div className="space-y-2 bg-[#6f8f95] px-3 py-3">
            <div className="h-2 w-2/3 rounded-full bg-white/55" />
            <div className="h-1.5 w-full rounded-full bg-white/35" />
            <div className="h-1.5 w-4/5 rounded-full bg-white/35" />
          </div>
          <div className="space-y-2 px-3 py-3">
            <div className="h-1.5 w-full rounded-full bg-[#d8dde6]" />
            <div className="h-1.5 w-5/6 rounded-full bg-[#d8dde6]" />
            <div className="mt-3 h-8 rounded-[8px] bg-[#d9e8ea]" />
            <div className="h-8 rounded-[8px] bg-[#d9e8ea]" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "standard-technical") {
    return (
      <div className="h-full w-full rounded-[12px] bg-[#32404b] p-3 shadow-[0_18px_34px_rgba(18,25,39,0.28)]">
        <div className="space-y-2 rounded-[10px] border border-white/8 bg-[#2c3842] p-3">
          <div className="h-1.5 w-3/5 rounded-full bg-white/35" />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <div className="h-14 rounded-[8px] bg-white/8" />
              <div className="h-14 rounded-[8px] bg-white/8" />
            </div>
            <div className="space-y-2">
              <div className="h-14 rounded-[8px] bg-white/8" />
              <div className="h-14 rounded-[8px] bg-white/8" />
            </div>
          </div>
          <div className="h-[3px] w-full rounded-full bg-[#ef7656]" />
        </div>
      </div>
    );
  }

  if (variant === "modern-hybrid") {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-[12px] bg-[#dbe4df] p-3 shadow-[0_18px_34px_rgba(34,55,102,0.14)]">
        <div className="w-[76%] rounded-[10px] bg-white p-3 shadow-[0_12px_26px_rgba(50,70,120,0.18)]">
          <div className="flex items-start gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#bfc8d1]" />
            <div className="flex-1 space-y-1.5">
              <div className="h-2 w-2/5 rounded-full bg-[#7e8b9b]" />
              <div className="h-1.5 w-full rounded-full bg-[#d8dde7]" />
              <div className="h-1.5 w-4/5 rounded-full bg-[#d8dde7]" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-[0.42fr_0.58fr] gap-2.5">
            <div className="space-y-1.5">
              <div className="h-8 rounded-[8px] bg-[#eef1f6]" />
              <div className="h-8 rounded-[8px] bg-[#eef1f6]" />
            </div>
            <div className="space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-[#d8dde7]" />
              <div className="h-1.5 w-5/6 rounded-full bg-[#d8dde7]" />
              <div className="h-1.5 w-full rounded-full bg-[#d8dde7]" />
              <div className="h-1.5 w-4/5 rounded-full bg-[#d8dde7]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "academic-cv") {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-[12px] bg-[#d9edf5] p-3 shadow-[0_18px_34px_rgba(34,55,102,0.14)]">
        <div className="w-[80%] rounded-[8px] bg-white p-3 shadow-[0_12px_26px_rgba(50,70,120,0.16)]">
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="h-3 rounded-[4px] bg-[#eff4fa]" />
            ))}
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="h-1.5 w-full rounded-full bg-[#d8dde7]" />
            <div className="h-1.5 w-11/12 rounded-full bg-[#d8dde7]" />
            <div className="h-1.5 w-10/12 rounded-full bg-[#d8dde7]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded-[12px] bg-[linear-gradient(145deg,#f29d82_0%,#55637c_78%)] p-3 shadow-[0_18px_34px_rgba(34,55,102,0.18)]">
      <div className="flex h-full w-[44%] flex-col items-center justify-between rounded-[12px] bg-[#404c63] px-3 py-4 text-center text-white shadow-[0_12px_28px_rgba(18,25,39,0.28)]">
        <div className="space-y-1">
          <div className="h-1.5 w-12 rounded-full bg-white/60" />
          <div className="h-1.5 w-8 rounded-full bg-white/35" />
        </div>
        <div className="space-y-2">
          <div className="mx-auto h-1.5 w-16 rounded-full bg-white/50" />
          <div className="mx-auto h-1.5 w-12 rounded-full bg-white/35" />
          <div className="mx-auto h-1.5 w-14 rounded-full bg-white/35" />
        </div>
        <div className="h-4 w-12 rounded-full bg-[#ef8a69]" />
      </div>
    </div>
  );
}

export function DeepFocusWizard() {
  const resumeInputId = useId();
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<WizardStep>(1);
  const [viewMode, setViewMode] = useState<ViewMode>("wizard");
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(sampleTemplates[0]?.id ?? "");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isDragActive, setIsDragActive] = useState(false);

  const selectedTemplate =
    sampleTemplates.find((template) => template.id === selectedTemplateId) ?? sampleTemplates[0];
  const canContinueFromRole = targetRole.trim().length > 0;
  const canContinueFromUpload = Boolean(resumeFile) && jobDescription.trim().length > 0;
  const stepOverview = [
    {
      id: "01",
      title: "Target the role",
      description: "Define the position first so the rest of the flow stays tailored.",
    },
    {
      id: "02",
      title: "Upload and compare",
      description: "Bring in the current resume and the target job description together.",
    },
    {
      id: "03",
      title: "Choose the finish",
      description: "Select the final layout once the matching context is already set.",
    },
  ] as const;

  function handleValidatedFile(fileList: FileList | null) {
    const candidateFile = fileList?.[0];

    if (!candidateFile) {
      return;
    }

    if (!isSupportedFile(candidateFile)) {
      setUploadError("Please choose a PDF, DOC, or DOCX resume.");
      return;
    }

    if (candidateFile.size > maxFileSize) {
      setUploadError("Your resume must be 10 MB or smaller.");
      return;
    }

    setUploadError("");
    setResumeFile(candidateFile);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    handleValidatedFile(event.target.files);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragActive(false);
    handleValidatedFile(event.dataTransfer.files);
  }

  function handleNext() {
    if (step === 1 && canContinueFromRole) {
      setStep(2);
      return;
    }

    if (step === 2 && canContinueFromUpload) {
      setStep(3);
      return;
    }

    if (step === 3) {
      setViewMode("workspace");
    }
  }

  function handleBack() {
    if (viewMode === "workspace") {
      setViewMode("wizard");
      setStep(3);
      return;
    }

    if (step === 1) {
      return;
    }

    setStep((currentStep) => (currentStep === 3 ? 2 : 1));
  }

  function openFilePicker() {
    resumeInputRef.current?.click();
  }

  const backLabel = step === 3 ? "Back to Upload" : "Back";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[color:var(--page-bg)] text-[color:var(--page-text)]">
      <div
        aria-hidden
        className="absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_1px_1px,rgba(79,107,255,0.14)_1px,transparent_0)] [background-size:24px_24px]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(79,107,255,0.16),transparent_68%)]"
      />

      <div className="relative flex min-h-screen w-full px-2 py-2 sm:px-4 sm:py-4">
        <div className="flex min-h-[calc(100svh-1rem)] w-full flex-col overflow-hidden rounded-[22px] border-[4px] border-[color:var(--brand)] bg-[color:var(--page-surface)] shadow-[var(--shadow-lg)] sm:min-h-[calc(100svh-2rem)] sm:rounded-[28px]">
          {viewMode === "workspace" ? (
            <AnalysisWorkspace
              targetRole={targetRole}
              selectedTemplateName={selectedTemplate?.name ?? "Selected template"}
              resumeFileName={resumeFile?.name ?? "resume.pdf"}
              onBack={() => {
                setViewMode("wizard");
                setStep(3);
              }}
            />
          ) : (
            <>
          <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-[color:var(--page-line)] px-4 py-4 sm:px-6">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className="inline-flex items-center gap-2 justify-self-start rounded-full px-2 py-1 text-sm font-medium text-[color:var(--page-muted)] transition hover:text-[color:var(--page-text)] disabled:cursor-default disabled:opacity-60 disabled:hover:text-[color:var(--page-muted)]"
            >
              <ArrowLeftIcon />
              {backLabel}
            </button>

              <div className="flex items-center gap-2 justify-self-center text-sm font-semibold text-[color:var(--page-text)]">
                <BrandMark />
                Deep Focus
            </div>

            <div className="justify-self-end">
              {step > 1 ? <span className="step-pill">{`STEP ${step} OF 3`}</span> : null}
            </div>
          </header>

          <div className="flex flex-1 flex-col">
            {step === 1 ? (
              <section className="section-reveal flex flex-1 px-5 py-10 sm:px-8 lg:px-12 xl:px-14">
                <div className="grid w-full gap-10 xl:grid-cols-[minmax(0,1.1fr)_25rem] xl:items-center">
                  <div className="flex max-w-3xl flex-col justify-center">
                    <span className="step-pill w-fit">Resume analysis flow</span>

                    <div className="mt-7 space-y-4">
                      <h1 className="font-display text-5xl font-semibold tracking-tight text-[color:var(--page-text)] sm:text-6xl">
                        Build the analysis around one clear target role.
                      </h1>
                      <p className="max-w-2xl text-base leading-7 text-[color:var(--page-muted)]">
                        Start with the position you want, then we&apos;ll guide the upload,
                        comparison, and layout choice around that goal.
                      </p>
                    </div>

                    <div className="mt-10 grid gap-4 lg:grid-cols-3">
                      {stepOverview.map((stepItem) => (
                        <div
                          key={stepItem.id}
                          className="rounded-[20px] border border-[color:var(--page-line)] bg-[#fbfcff] px-4 py-4 shadow-[0_8px_22px_rgba(59,75,138,0.05)]"
                        >
                          <p className="font-mono text-sm font-semibold text-[color:var(--brand)]">
                            {stepItem.id}
                          </p>
                          <h2 className="mt-3 text-lg font-semibold text-[color:var(--page-text)]">
                            {stepItem.title}
                          </h2>
                          <p className="mt-2 text-sm leading-6 text-[color:var(--page-muted)]">
                            {stepItem.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="xl:justify-self-end">
                    <section className="w-full rounded-[28px] border border-[color:var(--page-line)] bg-white p-6 text-center shadow-[var(--shadow-md)] sm:p-7">
                      <div className="h-1.5 w-20 rounded-full bg-[color:var(--brand-strong)]" />

                      <div className="mt-7 space-y-3">
                        <h2 className="font-display text-4xl font-semibold tracking-tight text-[color:var(--page-text)]">
                          What role are you targeting?
                        </h2>
                        <p className="text-sm leading-6 text-[color:var(--page-muted)]">
                          We&apos;ll tailor your resume analysis to this specific position.
                        </p>
                      </div>

                      <label
                        className="mt-7 flex items-center gap-3 rounded-[16px] border border-[color:var(--page-line)] bg-[#f8faff] px-4 py-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition focus-within:border-[color:var(--brand)] focus-within:bg-white"
                        htmlFor="target-role"
                      >
                        <span className="text-[color:var(--page-muted)]">
                          <BriefcaseIcon />
                        </span>
                        <input
                          id="target-role"
                          value={targetRole}
                          onChange={(event) => {
                            setTargetRole(event.target.value);
                          }}
                          placeholder="e.g. Senior Frontend Engineer"
                          className="w-full border-none bg-transparent text-[color:var(--page-text)] outline-none placeholder:text-[#b4bfd3]"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canContinueFromRole}
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,107,255,0.24)] transition hover:bg-[color:var(--brand-strong)] disabled:cursor-not-allowed disabled:bg-[#c4ccf0] disabled:shadow-none"
                      >
                        Next: Job Details
                        <ArrowRightIcon />
                      </button>
                    </section>
                  </div>
                </div>
              </section>
            ) : null}

            {step === 2 ? (
              <section key="step-2" className="section-reveal flex flex-1 flex-col px-5 py-8 sm:px-8 lg:px-12">
                <div className="w-full">
                  <div className="space-y-3 text-left sm:text-center">
                    <div className="sm:flex sm:justify-center">
                      <span className="step-pill">STEP 2 OF 3</span>
                    </div>
                    <h1 className="font-display text-4xl font-semibold tracking-tight text-[color:var(--page-text)]">
                      Document Upload
                    </h1>
                    <p className="max-w-[42rem] text-sm leading-6 text-[color:var(--page-muted)] sm:mx-auto">
                      Upload your current resume and paste the target job description to begin
                      the analysis.
                    </p>
                  </div>

                  <div className="mt-9 grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
                    <div className="grid gap-6 lg:grid-cols-2">
                      <div>
                        <p className="mb-3 text-sm font-semibold text-[color:var(--page-text)]">
                          Current Resume
                        </p>
                        <label
                          htmlFor={resumeInputId}
                          onDragOver={(event) => {
                            event.preventDefault();
                            setIsDragActive(true);
                          }}
                          onDragLeave={() => setIsDragActive(false)}
                          onDrop={handleDrop}
                          className={`flex min-h-[18rem] cursor-pointer flex-col items-center justify-center rounded-[20px] border-2 border-dashed px-6 py-8 text-center transition ${
                            isDragActive
                              ? "border-[color:var(--brand)] bg-[color:var(--brand-soft)]"
                              : "border-[color:var(--page-line-strong)] bg-[#fbfcff]"
                          }`}
                        >
                          <input
                            id={resumeInputId}
                            ref={resumeInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="sr-only"
                          onChange={handleFileChange}
                        />

                          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--page-line)] bg-white text-[color:var(--page-muted)] shadow-sm">
                            <UploadIcon />
                          </div>

                          {resumeFile ? (
                            <div className="mt-5 space-y-2">
                              <p className="text-lg font-semibold text-[color:var(--page-text)]">
                                {resumeFile.name}
                              </p>
                              <p className="text-sm text-[color:var(--page-muted)]">
                                {formatFileSize(resumeFile.size)} ready for analysis
                              </p>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  openFilePicker();
                                }}
                                className="mt-2 inline-flex items-center justify-center rounded-full border border-[color:var(--page-line)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--page-text)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                              >
                                Replace file
                              </button>
                            </div>
                          ) : (
                            <div className="mt-5 space-y-2">
                              <p className="text-lg font-semibold text-[color:var(--page-text)]">
                                Drag &amp; drop your resume here
                              </p>
                              <p className="text-sm text-[color:var(--page-muted)]">
                                Supports PDF, DOCX up to 10 MB
                              </p>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  openFilePicker();
                                }}
                                className="mt-2 inline-flex items-center justify-center rounded-full border border-[color:var(--page-line)] bg-white px-4 py-2 text-sm font-semibold text-[color:var(--page-text)] transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)]"
                              >
                                Browse files
                              </button>
                            </div>
                          )}
                        </label>

                        <p className="mt-3 min-h-6 text-sm text-[#e16f62]">
                          {uploadError}
                        </p>
                      </div>

                      <div>
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-[color:var(--page-text)]">
                            Target Job Description
                          </p>
                          <button
                            type="button"
                          onClick={() => {
                            setJobDescription("");
                          }}
                          className="text-sm font-semibold text-[color:var(--brand)] transition hover:text-[color:var(--brand-strong)]"
                        >
                            Clear text
                          </button>
                        </div>

                        <textarea
                          value={jobDescription}
                        onChange={(event) => {
                          setJobDescription(event.target.value);
                        }}
                        placeholder="Paste the full job description here to optimize your resume against it..."
                        className="min-h-[18rem] w-full rounded-[20px] border border-[color:var(--page-line)] bg-white px-5 py-4 text-sm leading-6 text-[color:var(--page-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition placeholder:text-[#b4bfd3] focus:border-[color:var(--brand)]"
                        />

                        <div className="mt-3 flex items-center justify-between text-sm text-[color:var(--page-muted)]">
                          <span>Role target: {targetRole || "Not set"}</span>
                          <span>{jobDescription.trim().length} characters</span>
                        </div>
                      </div>
                    </div>

                    <aside className="rounded-[20px] border border-[color:var(--page-line)] bg-[#fbfcff] p-5 shadow-[0_10px_26px_rgba(59,75,138,0.05)]">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
                        Flow Summary
                      </p>
                      <div className="mt-5 space-y-5">
                        <div>
                          <p className="text-sm text-[color:var(--page-muted)]">Target role</p>
                          <p className="mt-1 text-base font-semibold text-[color:var(--page-text)]">
                            {targetRole || "Waiting for role"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[color:var(--page-muted)]">Resume status</p>
                          <p className="mt-1 text-base font-semibold text-[color:var(--page-text)]">
                            {resumeFile ? "Ready to compare" : "No file selected"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[color:var(--page-muted)]">Job description</p>
                          <p className="mt-1 text-base font-semibold text-[color:var(--page-text)]">
                            {jobDescription.trim().length > 0 ? "Added" : "Awaiting paste"}
                          </p>
                        </div>
                        <div className="rounded-[16px] border border-[color:var(--page-line)] bg-white px-4 py-4">
                          <p className="text-sm font-semibold text-[color:var(--page-text)]">
                            Next up
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[color:var(--page-muted)]">
                            Once both inputs are ready, we&apos;ll move to template selection for
                            the final output.
                          </p>
                        </div>
                      </div>
                    </aside>
                  </div>
                </div>

                <div className="mt-auto border-t border-[color:var(--page-line)] pt-6">
                  <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm leading-6 text-[color:var(--page-muted)]">
                      {resumeFile
                        ? `Selected file: ${resumeFile.name}`
                        : "Add a resume and a target job description to unlock templates."}
                    </p>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!canContinueFromUpload}
                      className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,107,255,0.22)] transition hover:bg-[color:var(--brand-strong)] disabled:cursor-not-allowed disabled:bg-[#c4ccf0] disabled:shadow-none"
                    >
                      Continue to Templates
                      <ArrowRightIcon />
                    </button>
                  </div>
                </div>
              </section>
            ) : null}

            {step === 3 ? (
              <section key="step-3" className="section-reveal flex flex-1 flex-col px-5 py-8 sm:px-8 lg:px-10">
                <div className="w-full">
                  <div className="space-y-3 text-left sm:text-center">
                    <div className="sm:flex sm:justify-center">
                      <span className="step-pill">STEP 3 OF 3</span>
                    </div>
                    <h1 className="font-display text-4xl font-semibold tracking-tight text-[color:var(--page-text)]">
                      Select a Template
                    </h1>
                    <p className="max-w-[42rem] text-sm leading-6 text-[color:var(--page-muted)] sm:mx-auto">
                      Choose an ATS-optimized layout for your final resume. All templates pass
                      standard parser checks.
                    </p>
                  </div>

                  <div className="mt-10 grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
                    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                      {sampleTemplates.map((template) => {
                        const isSelected = template.id === selectedTemplateId;

                        return (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => {
                              setSelectedTemplateId(template.id);
                            }}
                            className={`group relative overflow-hidden rounded-[18px] border bg-white text-left shadow-[0_12px_28px_rgba(59,75,138,0.07)] transition ${
                              isSelected
                                ? "border-[color:var(--brand)] ring-2 ring-[color:var(--brand-soft)]"
                                : "border-[color:var(--page-line)] hover:-translate-y-0.5 hover:border-[color:var(--page-line-strong)]"
                            }`}
                          >
                            <div className={`h-[13.5rem] border-b border-[color:var(--page-line)] p-4 ${template.thumbnailClass}`}>
                              <TemplatePreview variant={template.previewVariant} />
                            </div>
                            <div className="space-y-2 px-4 py-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-lg font-semibold text-[color:var(--page-text)]">
                                    {template.name}
                                  </p>
                                  <div className="mt-1 flex items-center gap-2 text-sm text-[color:var(--page-muted)]">
                                    <span className="h-2 w-2 rounded-full bg-[color:var(--success)]" />
                                    {template.atsLabel ?? "ATS-Friendly"}
                                  </div>
                                </div>

                                {isSelected ? (
                                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--brand)] text-white shadow-[0_10px_20px_rgba(79,107,255,0.22)]">
                                    <CheckIcon />
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <aside className="rounded-[20px] border border-[color:var(--page-line)] bg-[#fbfcff] p-5 shadow-[0_10px_26px_rgba(59,75,138,0.05)]">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
                        Selected Output
                      </p>
                      <div className="mt-5 space-y-5">
                        <div>
                          <p className="text-sm text-[color:var(--page-muted)]">Template</p>
                          <p className="mt-1 text-base font-semibold text-[color:var(--page-text)]">
                            {selectedTemplate?.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[color:var(--page-muted)]">Target role</p>
                          <p className="mt-1 text-base font-semibold text-[color:var(--page-text)]">
                            {targetRole || "Waiting for role"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[color:var(--page-muted)]">Resume file</p>
                          <p className="mt-1 text-base font-semibold text-[color:var(--page-text)]">
                            {resumeFile?.name ?? "No file selected"}
                          </p>
                        </div>
                        <div className="rounded-[16px] border border-[color:var(--page-line)] bg-white px-4 py-4">
                          <p className="text-sm font-semibold text-[color:var(--page-text)]">
                            Output note
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[color:var(--page-muted)]">
                            This selection controls presentation only. Your source resume and
                            job-description context stay unchanged.
                          </p>
                        </div>
                      </div>
                    </aside>
                  </div>
                </div>

                <div className="mt-auto border-t border-[color:var(--page-line)] pt-6">
                  <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-[color:var(--page-text)]">
                        {selectedTemplate?.name}
                      </p>
                      <p className="text-sm leading-6 text-[color:var(--page-muted)]">
                        Ready for {targetRole || "your target role"} with {resumeFile?.name ?? "your selected resume"}.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,107,255,0.22)] transition hover:bg-[color:var(--brand-strong)]"
                    >
                      Generate Analysis
                      <ArrowRightIcon />
                    </button>
                  </div>
                </div>
              </section>
            ) : null}
          </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
