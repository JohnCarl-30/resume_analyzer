import type { ResumeAnalysisResult } from "../model/resume-analysis";
import type { ResumeForm } from "../model/resume-form";

export type AnalysisNextStepAction = "personal" | "skills" | "experience" | "education" | "job";

export interface AnalysisNextStep {
  id: string;
  title: string;
  description: string;
  complete: boolean;
  action: AnalysisNextStepAction;
  buttonLabel: string;
}

export interface AnalysisNextStepsState {
  statusLabel: string;
  statusTone: "strong" | "close" | "needs-work";
  summary: string;
  completedCount: number;
  totalCount: number;
  progress: number;
  missingKeywordPreview: string[];
  steps: AnalysisNextStep[];
}

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9+.#]+/g, " ").replace(/\s+/g, " ").trim();
}

function formSearchText(form: ResumeForm, analysisResult: ResumeAnalysisResult | null) {
  return normalize(
    [
      form.personalInfo.fullName,
      form.personalInfo.email,
      form.personalInfo.phone,
      form.personalInfo.summary,
      form.personalInfo.skills,
      ...form.education.flatMap((entry) => [
        entry.institution,
        entry.degree,
        entry.location,
        entry.dateRange,
      ]),
      ...form.experience.flatMap((entry) => [
        entry.role,
        entry.location,
        entry.dateRange,
        ...(entry.bullets ?? []),
      ]),
      ...form.projects.flatMap((entry) => [
        entry.name,
        entry.technologies,
        entry.link,
        entry.startDate,
        entry.endDate,
        ...(entry.bullets ?? []),
      ]),
      analysisResult?.parsedResumeText,
    ].filter(Boolean).join(" "),
  );
}

function hasTargetRole(targetRole: string, searchText: string) {
  const normalizedRole = normalize(targetRole);
  if (!normalizedRole) return true;

  const roleWords = normalizedRole.split(" ").filter((word) => word.length > 2);
  return searchText.includes(normalizedRole) || roleWords.every((word) => searchText.includes(word));
}

function hasEducation(form: ResumeForm) {
  return form.education.some((entry) =>
    [entry.institution, entry.degree, entry.location, entry.dateRange].some(hasText),
  );
}

function hasExperience(form: ResumeForm) {
  return form.experience.some((entry) =>
    [entry.role, entry.location, entry.dateRange, ...(entry.bullets ?? [])].some(hasText),
  );
}

function hasExperienceDetails(form: ResumeForm, analysisResult: ResumeAnalysisResult | null) {
  const hasBullets =
    form.experience.some((entry) => (entry.bullets ?? []).some(hasText)) ||
    form.projects.some((entry) => (entry.bullets ?? []).some(hasText));
  return hasBullets && (analysisResult ? analysisResult.metricsFound > 0 : true);
}

function hasSkills(form: ResumeForm) {
  return hasText(form.personalInfo.skills) || hasText(form.personalInfo.summary);
}

export function getAnalysisNextStepsState(
  form: ResumeForm,
  analysisResult: ResumeAnalysisResult | null,
  targetRole: string,
): AnalysisNextStepsState {
  const score = analysisResult?.score ?? 0;
  const missingKeywordCount = analysisResult?.missingKeywords.length ?? 0;
  const searchText = formSearchText(form, analysisResult);
  const roleComplete = hasTargetRole(targetRole, searchText);
  const skillsComplete = hasSkills(form) && missingKeywordCount <= 6;
  const educationComplete = hasEducation(form);
  const experienceComplete = hasExperience(form);
  const impactComplete = hasExperienceDetails(form, analysisResult);
  const jobComplete = Boolean(analysisResult && score >= 75 && missingKeywordCount <= 3);

  const steps: AnalysisNextStep[] = [
    {
      id: "target-role",
      title: `Add ${targetRole || "your target job"} near the top`,
      description: "Put the job title in your summary or most recent role so scanners know what you are applying for.",
      complete: roleComplete,
      action: "personal",
      buttonLabel: roleComplete ? "Review" : "Fix this section",
    },
    {
      id: "skills",
      title: "Add the right skills",
      description: missingKeywordCount > 0
        ? `Use missing job words naturally, starting with ${analysisResult?.missingKeywords.slice(0, 3).join(", ")}.`
        : "Keep your skills and summary aligned with the job post.",
      complete: skillsComplete,
      action: "skills",
      buttonLabel: skillsComplete ? "Review" : "Fix this section",
    },
    {
      id: "experience",
      title: "Fix your work bullets",
      description: impactComplete
        ? "Your bullets include concrete details. Review them for relevance to this job."
        : "Add real tools, actions, and numbers like users, speed, revenue, time saved, or percent improved.",
      complete: experienceComplete && impactComplete,
      action: "experience",
      buttonLabel: experienceComplete && impactComplete ? "Review" : "Fix this section",
    },
    {
      id: "education",
      title: "Add education",
      description: "Most ATS systems expect a clear Education section, even when experience is more important.",
      complete: educationComplete,
      action: "education",
      buttonLabel: educationComplete ? "Review" : "Fix this section",
    },
    {
      id: "job-match",
      title: "Check against the job post",
      description: "After editing, run the match again so the score and suggestions update for this role.",
      complete: jobComplete,
      action: "job",
      buttonLabel: jobComplete ? "Recheck" : "Check job post",
    },
  ];

  const completedCount = steps.filter((step) => step.complete).length;
  const totalCount = steps.length;
  const progress = Math.round((completedCount / totalCount) * 100);
  const statusTone =
    score >= 80 && missingKeywordCount <= 3 ? "strong" :
    score >= 60 ? "close" :
    "needs-work";
  const statusLabel =
    statusTone === "strong" ? "ATS ready" :
    statusTone === "close" ? "Getting close" :
    "Needs work";
  const summary =
    statusTone === "strong"
      ? "This resume has the core ATS signals for the job. A final human edit is still worth doing."
      : "Follow the checklist before printing. Each fix improves what resume scanners and recruiters can read.";

  return {
    statusLabel,
    statusTone,
    summary,
    completedCount,
    totalCount,
    progress,
    missingKeywordPreview: analysisResult?.missingKeywords.slice(0, 6) ?? [],
    steps,
  };
}
