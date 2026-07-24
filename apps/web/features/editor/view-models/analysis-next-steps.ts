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
  applyLabel?: string;
  applyDescription?: string;
}

export interface AnalysisNextStepsState {
  statusLabel: string;
  statusTone: "strong" | "close" | "needs-work";
  summary: string;
  completedCount: number;
  totalCount: number;
  progress: number;
  matchedKeywordPreview: string[];
  missingKeywordPreview: string[];
  scoreBreakdown?: {
    jobWords: number;
    mustHaves: number;
    clarity: number;
  };
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

function hasContactDetails(form: ResumeForm, analysisResult: ResumeAnalysisResult | null) {
  if (hasText(form.personalInfo.email) && hasText(form.personalInfo.phone)) {
    return true;
  }
  const searchText = formSearchText(form, analysisResult);
  return /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(searchText) && /\d{3}/.test(searchText);
}

function hasUnresolvedScannerIssues(
  form: ResumeForm,
  analysisResult: ResumeAnalysisResult | null,
  skillsComplete: boolean,
  experienceComplete: boolean,
  educationComplete: boolean,
) {
  if (!analysisResult) return true;
  if ((analysisResult.extractedCharacterCount ?? Number.POSITIVE_INFINITY) < 400) {
    return true;
  }
  if (analysisResult.suggestions.some((suggestion) => suggestion.id === "parse-thin-extract")) {
    return true;
  }
  if (!hasContactDetails(form, analysisResult)) {
    return true;
  }
  const headingIssue = analysisResult.suggestions.some(
    (suggestion) => suggestion.id === "ats-standard-headings",
  );
  return headingIssue && !(skillsComplete && experienceComplete && educationComplete);
}

export function getAnalysisNextStepsState(
  form: ResumeForm,
  analysisResult: ResumeAnalysisResult | null,
  targetRole: string,
): AnalysisNextStepsState {
  const score = analysisResult?.score ?? 0;
  const missingKeywordCount = analysisResult?.missingKeywords.length ?? 0;
  const matchedKeywordPreview = analysisResult?.matchedKeywords.slice(0, 6) ?? [];
  const missingKeywordPreview = analysisResult?.missingKeywords.slice(0, 6) ?? [];
  const firstMissingKeywords = missingKeywordPreview.slice(0, 5);
  const missingKeywordText = firstMissingKeywords.join(", ");
  const searchText = formSearchText(form, analysisResult);
  const roleComplete = hasTargetRole(targetRole, searchText);
  const skillsComplete = hasSkills(form) && missingKeywordCount <= 6;
  const educationComplete = hasEducation(form);
  const experienceComplete = hasExperience(form);
  const impactComplete = hasExperienceDetails(form, analysisResult);
  const scannerComplete = !hasUnresolvedScannerIssues(
    form,
    analysisResult,
    skillsComplete,
    experienceComplete,
    educationComplete,
  );
  const jobComplete = Boolean(analysisResult && score >= 75 && missingKeywordCount <= 3);

  const steps: AnalysisNextStep[] = [
    {
      id: "target-role",
      title: `Show ${targetRole || "the job title"} near the top`,
      description: "Put the job title in your summary or most recent role so the resume matches the job quickly.",
      complete: roleComplete,
      action: "personal",
      buttonLabel: roleComplete ? "Review" : "Edit section",
      applyLabel: roleComplete ? undefined : "Add suggestion",
      applyDescription: targetRole
        ? `Add "${targetRole}" to the summary near the top.`
        : "Add the job title to the summary near the top.",
    },
    {
      id: "scanner-ready",
      title: "Make sections easy to scan",
      description: scannerComplete
        ? "Contact details and clear section labels look ready for a text-based resume check."
        : "Add email and phone near the top, use plain Skills / Experience / Education headings, and prefer a simple PDF or DOCX with selectable text.",
      complete: scannerComplete,
      action: "personal",
      buttonLabel: scannerComplete ? "Review" : "Edit section",
      applyLabel: scannerComplete ? undefined : "Add suggestion",
      applyDescription: scannerComplete
        ? undefined
        : "Add your email and phone on the first lines of the header if they are missing.",
    },
    {
      id: "skills",
      title: "Add job words to Skills",
      description: missingKeywordCount > 0
        ? `Use missing job words naturally, starting with ${analysisResult?.missingKeywords.slice(0, 3).join(", ")}.`
        : "Keep your skills and summary aligned with the job post.",
      complete: skillsComplete,
      action: "skills",
      buttonLabel: skillsComplete ? "Review" : "Edit section",
      applyLabel: !skillsComplete && firstMissingKeywords.length > 0 ? "Add suggestion" : undefined,
      applyDescription:
        !skillsComplete && firstMissingKeywords.length > 0
          ? `Add ${missingKeywordText} to Skills so you can edit them in context.`
          : undefined,
    },
    {
      id: "experience",
      title: "Make work bullets clearer",
      description: impactComplete
        ? "Your bullets include concrete details. Review them for relevance to this job."
        : "Add real tools, actions, and numbers like users, speed, revenue, time saved, or percent improved.",
      complete: experienceComplete && impactComplete,
      action: "experience",
      buttonLabel: experienceComplete && impactComplete ? "Review" : "Edit section",
      applyLabel: experienceComplete && impactComplete ? undefined : "Add suggestion",
      applyDescription: "Add a bullet starter with placeholders for a real result, tool, and audience.",
    },
    {
      id: "education",
      title: "Add education",
      description: "Most resume checks expect a clear Education section, even when experience is more important.",
      complete: educationComplete,
      action: "education",
      buttonLabel: educationComplete ? "Review" : "Edit section",
      applyLabel: educationComplete ? undefined : "Add suggestion",
      applyDescription: "Add an Education row you can fill in.",
    },
    {
      id: "job-match",
      title: "Check again with the job post",
      description: "After editing, run the resume check again so the guidance updates for this role.",
      complete: jobComplete,
      action: "job",
      buttonLabel: jobComplete ? "Check again" : "Check job post",
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
    statusTone === "strong" ? "Ready to review" :
    statusTone === "close" ? "Getting close" :
    "Needs a few fixes";
  const summary =
    statusTone === "strong"
      ? "This resume has the core signals for the job. Give it one final human read before printing."
      : "Start with these fixes before printing. Each one makes the resume easier for scanners and recruiters to read.";

  return {
    statusLabel,
    statusTone,
    summary,
    completedCount,
    totalCount,
    progress,
    matchedKeywordPreview,
    missingKeywordPreview,
    scoreBreakdown: analysisResult?.scoreBreakdown,
    steps,
  };
}
