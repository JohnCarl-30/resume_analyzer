"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { WorkspaceRail } from "./workspace-rail";
import {
  BackpackIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CubeIcon,
  FileTextIcon,
  IdCardIcon,
  Pencil1Icon,
  PersonIcon,
  PlusIcon,
  StarIcon,
} from "@radix-ui/react-icons";
import React from "react";
import type { ResumeForm } from "../../model/resume-form";
import type { ResumeAnalysisResult } from "../../model/resume-analysis";
import type { BuilderGuideAction } from "../../view-models/create-resume-guide";
import type { AnalysisNextStepAction } from "../../view-models/analysis-next-steps";
import { getCreateResumeGuideState } from "../../view-models/create-resume-guide";
import { getAnalysisNextStepsState } from "../../view-models/analysis-next-steps";
import { PersonalInfoEditor } from "../editors/personal-info-editor";
import { ExperienceEditor } from "../editors/experience-editor";
import { EducationEditor } from "../editors/education-editor";
import { LeadershipEditor } from "../editors/leadership-editor";
import { AwardsEditor } from "../editors/awards-editor";
import { CreateResumeGuide } from "../workspace/create-resume-guide";
import { AnalysisNextSteps } from "../workspace/analysis-next-steps";
import { CloseIcon } from "../../../onboarding/components/wizard-icons";

export type AwardsEditorMode = "awards" | "credentials" | "publications";
export type LeadershipEditorMode = "leadership" | "research";

export const awardsEditorCopy: Record<
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

export const leadershipEditorCopy: Record<
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

/**
 * localStorage is not guaranteed: Safari private mode, blocked cookies and
 * storage-quota errors all make it throw or go missing. Reading it unguarded
 * took the whole sidebar down through the error boundary, so a remembered
 * layout preference is treated as best-effort -- losing it is not worth
 * losing the editor.
 */
function readStoredPanel(key: string): boolean | null {
  try {
    const value = window.localStorage?.getItem?.(key);
    return value === null || value === undefined ? null : value === "open";
  } catch {
    return null;
  }
}

function writeStoredPanel(key: string, open: boolean): void {
  try {
    window.localStorage?.setItem?.(key, open ? "open" : "closed");
  } catch {
    // Preference not remembered; the editor still works.
  }
}

/** Shared so the rail's filled-in dots and the list's empty hints agree. */
export function isSectionEmpty(sectionId: string, form: ResumeForm): boolean {
  switch (sectionId) {
    case "education":
      return form.education.length === 0;
    case "experience":
      return form.experience.length === 0;
    case "leadership":
      return form.leadership.length === 0;
    case "awards":
      return form.awards.length === 0;
    case "personal":
      return !form.personalInfo.fullName && !form.personalInfo.email;
    default:
      return false;
  }
}

const workspaceSections = [
  { id: "personal", label: "Personal Info", icon: "personal", expanded: true },
  { id: "education", label: "Education", icon: "education", expanded: false },
  { id: "experience", label: "Work Experience", icon: "experience", expanded: false },
  { id: "leadership", label: "Leadership", icon: "leadership", expanded: false },
  { id: "awards", label: "Awards & Honors", icon: "awards", expanded: false },
] as const;

/**
 * Line icons rather than emoji.
 *
 * Emoji render in each platform's own house style -- colour, weight and
 * baseline all differ from Apple to Windows to Android -- so a sidebar built
 * from them cannot look like one set. These inherit currentColor and sit on
 * the text baseline like the rest of the UI.
 */
/**
 * Icon-only controls need a hit area of their own: the glyphs are ~15px, so
 * an unpadded button is a 15px tap target. 44px is the minimum Apple and
 * Google both recommend for touch.
 */
const iconButtonClass =
  "inline-flex size-11 items-center justify-center rounded-lg transition sm:size-8";

function sectionIcon(icon: string) {
  const iconMap: Record<string, React.ReactNode> = {
    personal: <PersonIcon aria-hidden="true" />,
    education: <BackpackIcon aria-hidden="true" />,
    experience: <IdCardIcon aria-hidden="true" />,
    leadership: <PersonIcon aria-hidden="true" />,
    awards: <StarIcon aria-hidden="true" />,
    projects: <CubeIcon aria-hidden="true" />,
  };
  return iconMap[icon] ?? <FileTextIcon aria-hidden="true" />;
}

interface WorkspaceSidebarProps {
  activeSectionId: string | null;
  setActiveSectionId: (id: string | null) => void;
  formValues: ResumeForm;
  createMode: boolean;
  resumeTitle: string;
  mounted: boolean;
  analysisResult: ResumeAnalysisResult | null;
  targetRole: string;
  tailorEnabled: boolean;
  tailorDraftLoading: boolean;
  tailorProposals: unknown[];
  leadershipEditorMode: LeadershipEditorMode;
  awardsEditorMode: AwardsEditorMode;
  setLeadershipEditorMode: (mode: LeadershipEditorMode) => void;
  setAwardsEditorMode: (mode: AwardsEditorMode) => void;
  enhanceBullets: (role: string, bullets: string[]) => Promise<string[]>;
  updatePersonalInfo: (data: Partial<ResumeForm["personalInfo"]>) => void;
  updateEducation: (id: string, data: Partial<import("../../model/resume-form").EducationEntry>) => void;
  addEducation: () => string;
  removeEducation: (id: string) => void;
  updateExperience: (id: string, data: Partial<import("../../model/resume-form").ExperienceEntry>) => void;
  addExperience: (draft?: Partial<import("../../model/resume-form").ExperienceEntry>) => string;
  removeExperience: (id: string) => void;
  addExperienceBullet: (id: string, bullet: string) => void;
  updateExperienceBullet: (id: string, index: number, bullet: string) => void;
  removeExperienceBullet: (id: string, index: number) => void;
  updateLeadership: (id: string, data: Partial<import("../../model/resume-form").LeadershipEntry>) => void;
  addLeadership: () => void;
  removeLeadership: (id: string) => void;
  updateAwards: (index: number, value: string) => void;
  addAward: () => void;
  removeAward: (index: number) => void;
  openPrimaryReview: () => void;
  handleGuideAction: (action: BuilderGuideAction) => void;
  handleAnalysisStepAction: (action: AnalysisNextStepAction) => void;
  handleApplyAnalysisStepAction: (action: AnalysisNextStepAction) => void;
  handleExportJson: () => void;
  handlePrint: () => void;
  handleResetCreateDraft: () => void;
  openAddContentModal: () => void;
  openProjectModal: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  mobileSidebarOpen: boolean;
}

export function WorkspaceSidebar({
  activeSectionId,
  setActiveSectionId,
  formValues,
  createMode,
  resumeTitle,
  mounted,
  analysisResult,
  targetRole,
  tailorEnabled,
  tailorDraftLoading,
  tailorProposals,
  leadershipEditorMode,
  awardsEditorMode,
  setLeadershipEditorMode,
  setAwardsEditorMode,
  enhanceBullets,
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
  openPrimaryReview,
  handleGuideAction,
  handleAnalysisStepAction,
  handleApplyAnalysisStepAction,
  handleExportJson,
  handlePrint,
  handleResetCreateDraft,
  openAddContentModal,
  openProjectModal,
  setMobileSidebarOpen,
  mobileSidebarOpen,
}: WorkspaceSidebarProps) {
  const editorSections = [
    ...workspaceSections,
    ...(formValues.projects.length > 0
      ? [{ id: "projects", label: "Projects", icon: "projects" as const, expanded: false }]
      : []),
  ];

  const createResumeGuide = getCreateResumeGuideState(formValues, {
    hasSelectedTemplate: true,
  });

  const analysisNextSteps =
    !createMode && analysisResult ? getAnalysisNextStepsState(formValues, analysisResult, targetRole) : null;

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

  function renderEditor() {
    if (activeSectionId === "personal") {
      return (
        <PersonalInfoEditor
          data={formValues.personalInfo}
          onChange={updatePersonalInfo}
          onBack={() => setActiveSectionId(null)}
        />
      );
    }
    if (activeSectionId === "experience") {
      return (
        <ExperienceEditor
          entries={formValues.experience}
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
          entries={formValues.education}
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
          entries={formValues.leadership}
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
          entries={formValues.awards}
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
                onPrint={handlePrint}
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
            const isEmpty = isSectionEmpty(section.id, formValues);
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
                      aria-label={activeSectionId === section.id ? "Collapse section" : "Expand section"}
                      className={`${iconButtonClass} rounded-full text-[color:var(--page-muted)] hover:bg-[color:var(--brand-soft)] hover:text-[color:var(--brand)]`}
                    >
                      {activeSectionId === section.id ? (
                        <ChevronDownIcon aria-hidden="true" />
                      ) : (
                        <ChevronRightIcon aria-hidden="true" />
                      )}
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
                        className={`${iconButtonClass} text-[color:var(--brand)] hover:bg-[color:var(--page-bg)] hover:text-[color:var(--brand-strong)]`}
                        aria-label="Edit section"
                      >
                        <Pencil1Icon aria-hidden="true" />
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSectionAdd(section.id)}
                          className={`${iconButtonClass} text-[color:var(--brand)] hover:bg-[color:var(--page-bg)] hover:text-[color:var(--brand-strong)]`}
                          aria-label="Add item"
                        >
                          <PlusIcon aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSectionOpen(section.id)}
                          className={`${iconButtonClass} text-[color:var(--page-muted)] hover:bg-[color:var(--page-bg)] hover:text-[color:var(--page-text)]`}
                          aria-label="Open section"
                        >
                          <ChevronRightIcon aria-hidden="true" />
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
                <PlusIcon aria-hidden="true" />
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
              <PlusIcon aria-hidden="true" />
              Add Section
            </button>
          </div>
        )}
      </div>
    );
  }

  // Focus mode: the panel collapses so the resume gets the width, while the
  // rail keeps the sections reachable. Persisted, because a collapsed panel
  // that silently reopens on reload is worse than not collapsing at all.
  const panelStorageKey = createMode ? "editor:panel:create" : "editor:panel:review";
  const [panelOpen, setPanelOpen] = useState(true);
  const [guideActive, setGuideActive] = useState(false);

  useEffect(() => {
    const stored = readStoredPanel(panelStorageKey);
    // Building from scratch starts open -- there is nothing to look at yet and
    // the form is the task. Reviewing starts on whatever was chosen last.
    setPanelOpen(stored ?? createMode);
  }, [panelStorageKey, createMode]);

  function updatePanel(open: boolean) {
    setPanelOpen(open);
    writeStoredPanel(panelStorageKey, open);
  }

  function handleRailSection(id: string) {
    if (panelOpen && !guideActive && activeSectionId === id) {
      updatePanel(false);
      return;
    }
    setGuideActive(false);
    setActiveSectionId(id);
    updatePanel(true);
  }

  function handleRailGuide() {
    if (panelOpen && guideActive) {
      updatePanel(false);
      return;
    }
    setGuideActive(true);
    updatePanel(true);
  }

  return (
    <aside
      className={`shrink-0 border-r border-[color:var(--page-line)] bg-white transition-[transform,width] duration-200 ease-out ${
        createMode
          ? `flex w-full border-r-0 xl:flex xl:border-r ${panelOpen ? "xl:w-[390px]" : "xl:w-14"}`
          : `fixed inset-y-0 left-0 z-50 w-80 transform ${
              mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } xl:static xl:z-auto xl:transform-none xl:translate-x-0 ${
              panelOpen ? "xl:w-[360px] 2xl:w-[400px]" : "xl:w-14"
            }`
      }`}
    >
      <div className="flex h-full">
        {/* The rail is a pointer-width affordance: below xl the sidebar is
            already a full-width sheet or a slide-over, where a 56px strip of
            icons next to a form would only take space from it. */}
        <div className="hidden xl:flex">
          <WorkspaceRail
            sections={workspaceSections.map((section) => ({
              id: section.id,
              label: section.label,
              icon: section.icon,
              complete: mounted && !isSectionEmpty(section.id, formValues),
            }))}
            activeSectionId={activeSectionId}
            panelOpen={panelOpen}
            guideActive={guideActive}
            onSelectSection={handleRailSection}
            onToggleGuide={handleRailGuide}
            onAddSection={openAddContentModal}
          />
        </div>

      <div className={cn("flex h-full min-w-0 flex-1 flex-col", !panelOpen && "xl:hidden")}>
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
      </div>
    </aside>
  );
}
