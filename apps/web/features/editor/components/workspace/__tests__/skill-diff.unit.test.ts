import { describe, expect, it } from "vitest";

import { skillDiff } from "../../../lib/skill-diff";

describe("skillDiff", () => {
  it("highlights only newly added skills", () => {
    const result = skillDiff(
      "PHP, JavaScript, TypeScript",
      "C#, Golang, PHP, JavaScript, TypeScript, RAG Pipelines",
    );

    expect(result.added).toEqual(["C#", "Golang", "RAG Pipelines"]);
    expect(result.removed).toEqual([]);
    expect(result.kept).toEqual(["PHP", "JavaScript", "TypeScript"]);
  });

  it("detects removed skills", () => {
    const result = skillDiff("React, Vue, Angular", "React, Angular");
    expect(result.removed).toEqual(["Vue"]);
    expect(result.added).toEqual([]);
  });
});
