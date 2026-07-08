import type { ResumeForm } from "../model/resume-form";

export type BuilderGuideAction = "personal" | "education" | "experience" | "template" | "export";

export interface BuilderGuideItem {
  id: BuilderGuideAction;
  label: string;
  complete: boolean;
  button: string;
}

export interface CreateResumeGuideState {
  items: BuilderGuideItem[];
  warnings: string[];
  completedCount: number;
  totalCount: number;
  progress: number;
}

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

export function getCreateResumeGuideState(
  form: ResumeForm,
  options: { hasSelectedTemplate: boolean } = { hasSelectedTemplate: true },
): CreateResumeGuideState {
  const personalComplete =
    hasText(form.personalInfo.fullName) &&
    (hasText(form.personalInfo.email) || hasText(form.personalInfo.phone));
  const educationComplete = form.education.some(
    (entry) =>
      hasText(entry.institution) ||
      hasText(entry.degree) ||
      hasText(entry.location) ||
      hasText(entry.dateRange),
  );
  const experienceComplete = form.experience.some(
    (entry) =>
      hasText(entry.role) ||
      hasText(entry.location) ||
      hasText(entry.dateRange) ||
      (entry.bullets ?? []).some((bullet) => hasText(bullet)),
  );
  const impactDetailsComplete =
    form.experience.some((entry) => (entry.bullets ?? []).some((bullet) => hasText(bullet))) ||
    form.projects.some((project) => (project.bullets ?? []).some((bullet) => hasText(bullet)));
  const profileComplete = hasText(form.personalInfo.summary) || hasText(form.personalInfo.skills);

  const completionItems = [
    personalComplete,
    educationComplete,
    experienceComplete,
    impactDetailsComplete,
    profileComplete,
  ];
  const completedCount = completionItems.filter(Boolean).length;
  const totalCount = completionItems.length;
  const warnings = [
    !personalComplete ? "Add your name plus an email or phone number." : null,
    !educationComplete ? "Add at least one education entry." : null,
    !experienceComplete ? "Add at least one experience entry." : null,
    !impactDetailsComplete ? "Add bullets with impact details to experience or projects." : null,
    !profileComplete ? "Add a summary or skills so the resume has a clear profile." : null,
  ].filter(Boolean) as string[];

  return {
    completedCount,
    totalCount,
    progress: Math.round((completedCount / totalCount) * 100),
    warnings,
    items: [
      {
        id: "personal",
        label: "Personal Info",
        complete: personalComplete,
        button: personalComplete ? "Review" : "Add",
      },
      {
        id: "education",
        label: "Education",
        complete: educationComplete,
        button: educationComplete ? "Review" : "Add",
      },
      {
        id: "experience",
        label: "Experience",
        complete: experienceComplete && impactDetailsComplete,
        button: experienceComplete ? "Add bullets" : "Add",
      },
      {
        id: "template",
        label: "Resume style",
        complete: options.hasSelectedTemplate,
        button: "Choose",
      },
      {
        id: "export",
        label: "Finish",
        complete: warnings.length === 0,
        button: "Preview",
      },
    ],
  };
}
