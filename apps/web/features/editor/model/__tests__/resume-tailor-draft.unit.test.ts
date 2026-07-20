import { describe, expect, it } from "vitest";

import { buildTailorProposals, type ResumeTailorDraft } from "../resume-tailor-draft";

const draft: ResumeTailorDraft = {
  summary: {
    before: "Frontend developer.",
    after: "Frontend engineer with accessibility experience.",
  },
  skills: {
    before: "React",
    after: "React, accessibility, design systems",
  },
  experience: [
    {
      id: "exp_1",
      role: "Frontend Engineer",
      bullets: {
        before: ["Built dashboard components."],
        after: ["Built accessible dashboard components using design systems."],
      },
    },
  ],
};

describe("buildTailorProposals", () => {
  it("creates review items for changed summary, skills, and experience", () => {
    const proposals = buildTailorProposals(draft);

    expect(proposals).toHaveLength(3);
    expect(proposals[0]?.type).toBe("summary");
    expect(proposals[1]?.type).toBe("skills");
    expect(proposals[2]?.type).toBe("experience");
    expect(proposals[2]?.experienceId).toBe("exp_1");
  });

  it("skips unchanged sections", () => {
    const proposals = buildTailorProposals({
      summary: { before: "Same", after: "Same" },
      skills: { before: "React", after: "React" },
      experience: [],
    });

    expect(proposals).toHaveLength(0);
  });
});
