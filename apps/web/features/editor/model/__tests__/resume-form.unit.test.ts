import { describe, expect, it } from "vitest";

import type { ExtractedResumeProfile } from "../resume-extraction";
import { resumeFormFromExtractedProfile } from "../resume-form";

const extractedProfile: ExtractedResumeProfile = {
  fullName: "Jordan Lee",
  email: "jordan@example.com",
  phone: "555-0100",
  summary: "Backend engineer focused on APIs and data pipelines.",
  skills: ["TypeScript", "PostgreSQL", "AWS"],
  education: [],
  experience: [
    {
      role: "Software Engineer",
      location: "Remote",
      dateRange: "2022 — Present",
      bullets: ["Built REST APIs serving 1M requests/day"],
    },
  ],
  leadership: [],
  projects: [],
  awards: [],
};

describe("resumeFormFromExtractedProfile", () => {
  it("maps summary and skills from extracted profile", () => {
    const form = resumeFormFromExtractedProfile(extractedProfile);

    expect(form.personalInfo.fullName).toBe("Jordan Lee");
    expect(form.personalInfo.summary).toBe(
      "Backend engineer focused on APIs and data pipelines.",
    );
    expect(form.personalInfo.skills).toBe("TypeScript, PostgreSQL, AWS");
    expect(form.experience[0]?.bullets).toEqual(["Built REST APIs serving 1M requests/day"]);
  });

  it("returns default form when profile is missing", () => {
    const form = resumeFormFromExtractedProfile(null);

    expect(form.personalInfo.fullName).toBe("Alex Chen");
    expect(form.personalInfo.summary.length).toBeGreaterThan(0);
  });
});
