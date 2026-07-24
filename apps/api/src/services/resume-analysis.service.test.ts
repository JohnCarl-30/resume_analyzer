import { beforeEach, describe, expect, it, vi } from "vitest";

const { generateObjectMock } = vi.hoisted(() => ({
  generateObjectMock: vi.fn(),
}));

vi.mock("ai", () => ({
  generateObject: generateObjectMock,
}));

import { aiProvider } from "../lib/ai-provider.js";
import { resumeAnalysisService } from "./resume-analysis.service.js";

const sampleResumeText = `
Experienced Software Engineer building scalable web applications.
Managed a team of 5 developers.
Developed a new feature that increased user engagement by 20%.
Proficient in React, Node.js, and TypeScript.
Helped build a new API.
`;

const sampleAnalysisInput = {
  resumeText: sampleResumeText,
  jobDescription:
    "We are hiring a Frontend Engineer with React, Node.js, TypeScript, Docker, Kubernetes, and CI/CD experience.",
  targetRole: "Frontend Engineer",
  jdKeywords: ["React", "Node.js", "TypeScript", "Docker", "Kubernetes"],
  requiredSkills: ["React", "Node.js", "Docker", "Kubernetes"],
};

describe("resumeAnalysisService.analyze", () => {
  beforeEach(() => {
    generateObjectMock.mockReset();
    vi.spyOn(aiProvider, "isEnabled").mockReturnValue(false);
    vi.spyOn(aiProvider, "getModel").mockReturnValue("mock-model" as never);
  });

  it("reports matched and missing job keywords in parser-only mode", async () => {
    const result = await resumeAnalysisService.analyze(sampleAnalysisInput);

    expect(result.matchedKeywords).toEqual(
      expect.arrayContaining(["React", "Node.js", "TypeScript"]),
    );
    expect(result.missingKeywords).toEqual(
      expect.arrayContaining(["Docker", "Kubernetes"]),
    );
  });

  it("flags missing target role alignment for ATS in parser-only mode", async () => {
    const result = await resumeAnalysisService.analyze(sampleAnalysisInput);

    expect(result.suggestions.some((suggestion) => suggestion.id === "ats-target-role-alignment")).toBe(
      true,
    );
  });

  it("returns a bounded fit score, breakdown, and measurable impact count in parser-only mode", async () => {
    const result = await resumeAnalysisService.analyze(sampleAnalysisInput);

    expect(result.score).toBeGreaterThanOrEqual(20);
    expect(result.score).toBeLessThanOrEqual(98);
    expect(result.metricsFound).toBeGreaterThanOrEqual(1);
    expect(result.scoreBreakdown?.jobWords).toBeGreaterThanOrEqual(0);
    expect(result.suggestions.some((suggestion) => suggestion.id.startsWith("parse-"))).toBe(true);
  });

  it("uses AI output when AI is enabled and still merges scanner checks", async () => {
    vi.spyOn(aiProvider, "isEnabled").mockReturnValue(true);

    generateObjectMock.mockResolvedValue({
      object: {
        matchedKeywords: ["React", "GraphQL"],
        missingKeywords: ["Kubernetes"],
        metricsFound: 2,
        score: 84,
        suggestions: [
          {
            id: "missing-required-skills",
            title: "Add Kubernetes experience",
            detail: "The job post requires Kubernetes, but the resume does not show it.",
            severity: "high",
            category: "keywords",
          },
        ],
      },
    });

    const result = await resumeAnalysisService.analyze(sampleAnalysisInput);

    expect(generateObjectMock).toHaveBeenCalledOnce();
    expect(result.matchedKeywords).toEqual(["React", "GraphQL"]);
    expect(result.missingKeywords).toEqual(["Kubernetes"]);
    expect(result.score).toBe(84);
    expect(result.suggestions.some((suggestion) => suggestion.id === "missing-required-skills")).toBe(
      true,
    );
    expect(result.suggestions.some((suggestion) => suggestion.id === "ats-target-role-alignment")).toBe(
      true,
    );
    expect(result.scoreBreakdown).toEqual(
      expect.objectContaining({
        jobWords: expect.any(Number),
        mustHaves: expect.any(Number),
        clarity: expect.any(Number),
      }),
    );
  });

  it("falls back to parser-only analysis when AI fails", async () => {
    vi.spyOn(aiProvider, "isEnabled").mockReturnValue(true);
    generateObjectMock.mockRejectedValue(new Error("model unavailable"));

    const result = await resumeAnalysisService.analyze(sampleAnalysisInput);

    expect(result.matchedKeywords).toEqual(
      expect.arrayContaining(["React", "Node.js", "TypeScript"]),
    );
    expect(result.missingKeywords).toEqual(
      expect.arrayContaining(["Docker", "Kubernetes"]),
    );
  });
});
