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

const workspaceSections = [
  { id: "personal", label: "Personal Info", icon: "personal", expanded: true },
  { id: "education", label: "Education", icon: "education", expanded: false },
  { id: "experience", label: "Work Experience", icon: "experience", expanded: false },
  { id: "leadership", label: "Leadership", icon: "leadership", expanded: false },
  { id: "awards", label: "Awards & Honors", icon: "awards", expanded: false },
] as const;

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
            const isEmpty =
              section.id === "education" ? formValues.education.length === 0 :
              section.id === "experience" ? formValues.experience.length === 0 :
              section.id === "leadership" ? formValues.leadership.length === 0 :
              section.id === "awards" ? formValues.awards.length === 0 :
              section.id === "personal" ? (!formValues.personalInfo.fullName && !formValues.personalInfo.email) :
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
    <aside
      className={`shrink-0 border-r border-[color:var(--page-line)] bg-white transition-transform duration-300 ease-in-out ${
        createMode
          ? `flex w-full border-r-0 xl:flex xl:w-[390px] xl:border-r`
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
  );
}
