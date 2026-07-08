import { describe, expect, it } from "vitest";
import { emptyResumeForm, type ResumeForm } from "../../model/resume-form";
import { getCreateResumeGuideState } from "../create-resume-guide";

function completeResumeForm(): ResumeForm {
  return {
    personalInfo: {
      fullName: "Jordan Lee",
      phone: "",
      email: "jordan@example.com",
      summary: "Frontend engineer focused on accessible product UI.",
      skills: "",
    },
    education: [
      {
        id: "edu_1",
        institution: "State University",
        degree: "BS Computer Science",
        location: "Austin, TX",
        dateRange: "2020 - 2024",
      },
    ],
    experience: [
      {
        id: "exp_1",
        role: "Frontend Engineer",
        location: "Acme",
        dateRange: "2024 - Present",
        bullets: ["Improved onboarding completion by 18%."],
      },
    ],
    leadership: [],
    awards: [],
    projects: [],
  };
}

describe("getCreateResumeGuideState", () => {
  it("returns advisory warnings and zero progress for an empty resume", () => {
    const guide = getCreateResumeGuideState(emptyResumeForm);

    expect(guide.progress).toBe(0);
    expect(guide.completedCount).toBe(0);
    expect(guide.totalCount).toBe(5);
    expect(guide.warnings).toEqual([
      "Add your name plus an email or phone number.",
      "Add at least one education entry.",
      "Add at least one experience entry.",
      "Add bullets with impact details to experience or projects.",
      "Add a summary or skills so the resume has a clear profile.",
    ]);
    expect(guide.items.map((item) => item.label)).toEqual([
      "Personal Info",
      "Education",
      "Experience",
      "Resume style",
      "Finish",
    ]);
  });

  it("marks the guide complete when core resume sections are filled", () => {
    const guide = getCreateResumeGuideState(completeResumeForm());

    expect(guide.progress).toBe(100);
    expect(guide.completedCount).toBe(5);
    expect(guide.warnings).toEqual([]);
    expect(guide.items.every((item) => item.complete)).toBe(true);
  });
});
