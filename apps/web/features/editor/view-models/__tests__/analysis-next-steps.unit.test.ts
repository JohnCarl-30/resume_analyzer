import { describe, expect, it } from "vitest";
import type { ResumeAnalysisResult } from "../../model/resume-analysis";
import { emptyResumeForm, type ResumeForm } from "../../model/resume-form";
import { getAnalysisNextStepsState } from "../analysis-next-steps";

const baseAnalysis: ResumeAnalysisResult = {
  id: "analysis-next-steps",
  targetRole: "Frontend Engineer",
  jobDescription: "React TypeScript accessibility backend APIs performance",
  score: 20,
  metricsFound: 0,
  matchedKeywords: ["React"],
  missingKeywords: ["TypeScript", "accessibility", "backend", "APIs", "performance"],
  suggestions: [
    {
      id: "ats-target-role-alignment",
      title: "Add Frontend Engineer near the top",
      detail: "Add the target role near the top.",
      severity: "medium",
      category: "keywords",
    },
  ],
  generatedAt: "2026-06-06T00:00:00.000Z",
  parsedResumeText: "Pat Rivera\npat@example.com\n\nWorked on dashboards.",
};

const readyForm: ResumeForm = {
  personalInfo: {
    fullName: "Pat Rivera",
    phone: "",
    email: "pat@example.com",
    summary: "Frontend Engineer building accessible React and TypeScript interfaces.",
    skills: "React, TypeScript, accessibility, APIs, performance",
  },
  education: [
    {
      id: "edu_1",
      institution: "State University",
      degree: "BS Computer Science",
      location: "Manila",
      dateRange: "2020 - 2024",
    },
  ],
  experience: [
    {
      id: "exp_1",
      role: "Frontend Engineer",
      location: "Acme",
      dateRange: "2024 - Present",
      bullets: ["Built 12 accessible dashboard components and improved task completion by 30%."],
    },
  ],
  leadership: [],
  awards: [],
  projects: [],
};

describe("getAnalysisNextStepsState", () => {
  it("turns a weak analysis into plain-language ATS fixes", () => {
    const guide = getAnalysisNextStepsState(emptyResumeForm, baseAnalysis, "Frontend Engineer");

    expect(guide.statusLabel).toBe("Needs work");
    expect(guide.progress).toBeLessThan(100);
    expect(guide.missingKeywordPreview).toEqual([
      "TypeScript",
      "accessibility",
      "backend",
      "APIs",
      "performance",
    ]);
    expect(guide.steps.map((step) => step.title)).toEqual([
      "Add Frontend Engineer near the top",
      "Add the right skills",
      "Fix your work bullets",
      "Add education",
      "Check against the job post",
    ]);
    expect(guide.steps.filter((step) => !step.complete).every((step) => step.buttonLabel.length > 0)).toBe(true);
  });

  it("marks the checklist ready when role, skills, impact, education, and score are strong", () => {
    const guide = getAnalysisNextStepsState(
      readyForm,
      {
        ...baseAnalysis,
        score: 86,
        metricsFound: 1,
        missingKeywords: ["backend"],
        parsedResumeText: "",
      },
      "Frontend Engineer",
    );

    expect(guide.statusLabel).toBe("ATS ready");
    expect(guide.completedCount).toBe(5);
    expect(guide.progress).toBe(100);
    expect(guide.steps.every((step) => step.complete)).toBe(true);
  });
});
