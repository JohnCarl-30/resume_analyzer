import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateObjectMock } = vi.hoisted(() => ({
  generateObjectMock: vi.fn(),
}));

vi.mock("ai", () => ({
  generateObject: generateObjectMock,
}));

import { aiProvider } from "../lib/ai-provider.js";
import { resumeTailoringService } from "./resume-tailoring.service.js";

const sampleInput = {
  targetRole: "Frontend Engineer",
  jobDescription:
    "We need a Frontend Engineer with React, TypeScript, accessibility, and design systems experience.",
  missingKeywords: ["accessibility", "design systems"],
  matchedKeywords: ["React", "TypeScript"],
  form: {
    personalInfo: {
      fullName: "Jordan Lee",
      email: "jordan@example.com",
      phone: "555-0100",
      linkedin: "linkedin.com/in/jordanlee",
      github: "github.com/jordanlee",
      summary: "Frontend developer with React experience.",
      skills: "React, TypeScript, CSS",
    },
    experience: [
      {
        id: "exp_1",
        role: "Frontend Engineer",
        location: "Remote",
        dateRange: "2022 — Present",
        bullets: ["Built reusable React components for the dashboard."],
      },
    ],
  },
};

describe("resumeTailoringService.tailorResume", () => {
  beforeEach(() => {
    generateObjectMock.mockReset();
    vi.spyOn(aiProvider, "isEnabled").mockReturnValue(false);
    vi.spyOn(aiProvider, "getModel").mockReturnValue("mock-model" as never);
  });

  it("returns fallback summary, skills, and bullet proposals without AI", async () => {
    const draft = await resumeTailoringService.tailorResume(sampleInput);

    expect(draft.summary.before).toBe("Frontend developer with React experience.");
    expect(draft.summary.after).toContain("Frontend Engineer");
    expect(draft.skills.after).toContain("accessibility");
    expect(draft.skills.after).toContain("design systems");
    expect(draft.experience).toHaveLength(1);
    expect(draft.experience[0]?.bullets.after[0]).toContain("accessibility");
  });

  it("uses AI output when enabled", async () => {
    vi.spyOn(aiProvider, "isEnabled").mockReturnValue(true);
    generateObjectMock.mockResolvedValue({
      object: {
        summary: "Frontend engineer with React, accessibility, and design systems experience.",
        skills: "React, TypeScript, CSS, accessibility, design systems",
        experience: [
          {
            id: "exp_1",
            bullets: [
              "Built reusable React components with accessibility and design system standards.",
            ],
          },
        ],
      },
    });

    const draft = await resumeTailoringService.tailorResume(sampleInput);

    expect(draft.summary.after).toContain("accessibility");
    expect(draft.skills.after).toContain("design systems");
    expect(draft.experience[0]?.bullets.after[0]).toContain("accessibility");
  });
});
