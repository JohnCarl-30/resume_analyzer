import { describe, expect, it } from "vitest";

import { analyzeParseability } from "./parseability.analyzer.js";

const healthyResume = `
Jane Doe
jane.doe@example.com
+1 (415) 555-0199

Skills
React, TypeScript, accessibility, design systems, testing

Experience
Frontend Engineer, Acme — 2024-Present
Built dashboard features used by 12 product teams and reduced support tickets by 18%.
Partnered with design to ship reusable components across three customer-facing apps.

Education
BS Computer Science, State University — 2020-2024
Completed coursework in algorithms, databases, and human-computer interaction.
`;

describe("analyzeParseability", () => {
  it("passes a resume with contact details and enough text", () => {
    const result = analyzeParseability(healthyResume);

    expect(result.checks.hasEmail).toBe(true);
    expect(result.checks.hasPhone).toBe(true);
    expect(result.checks.extractLooksThin).toBe(false);
    expect(result.suggestions).toEqual([]);
    expect(result.penalty).toBe(0);
  });

  it("flags missing email and phone", () => {
    const result = analyzeParseability(`
Skills
React

Experience
Built features for a product team over two years with clear ownership.
Education
BS Computer Science
`);

    expect(result.checks.hasEmail).toBe(false);
    expect(result.checks.hasPhone).toBe(false);
    expect(result.suggestions.map((item) => item.id)).toEqual(
      expect.arrayContaining(["parse-missing-email", "parse-missing-phone"]),
    );
  });

  it("flags a thin extract that scanners struggle with", () => {
    const result = analyzeParseability("Jane Doe\nicon icon");

    expect(result.checks.extractLooksThin).toBe(true);
    expect(result.suggestions.some((item) => item.id === "parse-thin-extract")).toBe(true);
    expect(result.penalty).toBeGreaterThan(0);
  });
});
