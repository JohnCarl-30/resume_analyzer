import React from "react";
import { useResumeEditor } from "../view-models/use-resume-editor";
import { PersonalInfoEditor } from "../components/editors/personal-info-editor";
import { ExperienceEditor } from "../components/editors/experience-editor";
import { EducationEditor } from "../components/editors/education-editor";
import { LeadershipEditor } from "../components/editors/leadership-editor";
import { AwardsEditor } from "../components/editors/awards-editor";
import {
  UserCircleIcon,
  GraduationCapIcon,
  BriefcaseOutlineIcon,
  UsersIcon,
  TrophyIcon,
  SparklesIcon,
  ArrowLeftIcon,
  PencilIcon,
  ClockIcon,
  EyeIcon,
  GridIcon,
  DownloadIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "../../onboarding/components/wizard-icons";

interface AnalysisWorkspaceProps {
  targetRole: string;
  selectedTemplateName: string;
  resumeFileName: string;
  onBack: () => void;
}

const workspaceSections = [
  { id: "personal", label: "Personal Info", icon: "personal", expanded: true },
  { id: "education", label: "Education", icon: "education", expanded: false },
  { id: "experience", label: "Work Experience", icon: "experience", expanded: false },
  { id: "leadership", label: "Leadership", icon: "leadership", expanded: false },
  { id: "awards", label: "Awards & Honors", icon: "awards", expanded: false },
] as const;

export function AnalysisWorkspace({
  targetRole,
  selectedTemplateName,
  resumeFileName,
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
                  >
                    {activeSectionId === section.id ? <ChevronDownIcon /> : <ChevronRightIcon />}
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
          <div className="mx-auto aspect-[1/1.414] w-full max-w-5xl bg-white shadow-[var(--shadow-md)] px-8 py-10 sm:px-12 sm:py-14 lg:px-16 lg:py-16">
            <div className="h-full space-y-10">
              <header className="space-y-4 border-b border-[color:var(--page-line)] pb-8">
                <h1 className="text-4xl font-bold tracking-tight text-[color:var(--page-text)] uppercase text-center">
                  {form.personalInfo.fullName}
                </h1>
                <div className="flex justify-center gap-5 text-sm text-[color:var(--page-muted)]">
                  <span>{form.personalInfo.phone}</span>
                  <span className="opacity-40">•</span>
                  <span>{form.personalInfo.email}</span>
                </div>
              </header>

              <div className="grid gap-10">
                <section className="space-y-5">
                  <h2 className="text-xl font-bold text-[color:var(--brand)] uppercase tracking-widest border-b border-[color:var(--page-line)] pb-2">
                    Education
                  </h2>
                  <div className="space-y-6">
                    {form.education.map((edu) => (
                      <div key={edu.id} className="grid grid-cols-[1fr_auto] gap-2">
                        <div className="space-y-1">
                          <h3 className="font-bold text-[color:var(--page-text)]">{edu.institution}</h3>
                          <p className="text-sm italic text-[color:var(--page-muted)]">{edu.degree}</p>
                        </div>
                        <div className="text-right text-sm text-[color:var(--page-muted)]">
                          <p className="font-medium">{edu.location}</p>
                          <p>{edu.dateRange}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-5">
                  <h2 className="text-xl font-bold text-[color:var(--brand)] uppercase tracking-widest border-b border-[color:var(--page-line)] pb-2">
                    Professional Experience
                  </h2>
                  <div className="space-y-6">
                    {form.experience.map((exp) => (
                      <div key={exp.id} className="grid grid-cols-[1fr_auto] gap-2">
                        <div className="space-y-1">
                          <h3 className="font-bold text-[color:var(--page-text)]">{exp.role}</h3>
                        </div>
                        <div className="text-right text-sm text-[color:var(--page-muted)]">
                          <p className="font-medium">{exp.location}</p>
                          <p>{exp.dateRange}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-5">
                  <h2 className="text-xl font-bold text-[color:var(--brand)] uppercase tracking-widest border-b border-[color:var(--page-line)] pb-2">
                    Leadership & Volunteers
                  </h2>
                  <div className="space-y-6">
                    {form.leadership.map((lead) => (
                      <div key={lead.id} className="grid grid-cols-[1fr_auto] gap-2">
                        <div className="space-y-1">
                          <h3 className="font-bold text-[color:var(--page-text)]">{lead.role}</h3>
                          <p className="text-sm italic text-[color:var(--page-muted)]">{lead.organization}</p>
                        </div>
                        <div className="text-right text-sm text-[color:var(--page-muted)]">
                          <p className="font-medium">{lead.location}</p>
                          <p>{lead.dateRange}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-5">
                  <h2 className="text-xl font-bold text-[color:var(--brand)] uppercase tracking-widest border-b border-[color:var(--page-line)] pb-2">
                    Awards & Honors
                  </h2>
                  <ul className="list-inside list-disc space-y-2 text-[color:var(--page-muted)]">
                    {form.awards.map((award, index) => (
                      <li key={index}>{award}</li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
