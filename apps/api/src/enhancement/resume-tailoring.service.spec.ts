import { Test } from "@nestjs/testing";

import { AiProviderService } from "../ai/ai-provider.service.js";
import { AI_SDK } from "../ai/ai.module.js";
import { ResumeTailoringService } from "./resume-tailoring.service.js";

// Ported from the vitest suite that silently stopped running when the API
// moved to Jest -- module-level mocks become injected stubs.
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

async function makeService(options: { enabled: boolean; generateObject?: jest.Mock }) {
  const moduleRef = await Test.createTestingModule({
    providers: [
      ResumeTailoringService,
      { provide: AI_SDK, useValue: { generateObject: options.generateObject ?? jest.fn() } },
      {
        provide: AiProviderService,
        useValue: {
          isEnabled: () => options.enabled,
          getModel: async () => "mock-model",
        },
      },
    ],
  }).compile();

  return moduleRef.get(ResumeTailoringService);
}

describe("ResumeTailoringService", () => {
  it("returns fallback summary, skills, and bullet proposals without AI", async () => {
    const service = await makeService({ enabled: false });

    const draft = await service.tailorResume(sampleInput);

    expect(draft.summary.before).toBe("Frontend developer with React experience.");
    expect(draft.summary.after).toContain("Frontend Engineer");
    expect(draft.skills.after).toContain("accessibility");
    expect(draft.skills.after).toContain("design systems");
    expect(draft.experience).toHaveLength(1);
    expect(draft.experience[0]?.bullets.after[0]).toContain("accessibility");
  });

  it("uses AI output when enabled", async () => {
    const generateObject = jest.fn().mockResolvedValue({
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
    const service = await makeService({ enabled: true, generateObject });

    const draft = await service.tailorResume(sampleInput);

    expect(generateObject).toHaveBeenCalledTimes(1);
    expect(draft.summary.after).toContain("accessibility");
    expect(draft.skills.after).toContain("design systems");
    expect(draft.experience[0]?.bullets.after[0]).toContain("accessibility");
  });

  it("falls back when the AI call fails", async () => {
    const generateObject = jest.fn().mockRejectedValue(new Error("model unavailable"));
    const service = await makeService({ enabled: true, generateObject });

    const draft = await service.tailorResume(sampleInput);

    expect(draft.skills.after).toContain("accessibility");
  });
});
