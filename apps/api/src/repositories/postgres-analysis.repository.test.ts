import { describe, expect, it } from "vitest";

import { ANALYSIS_PUBLIC_COLUMN_KEYS } from "./postgres-analysis.repository.js";

describe("postgres analysis public columns", () => {
  it("excludes the PDF blob and embedding columns from public reads", () => {
    expect(ANALYSIS_PUBLIC_COLUMN_KEYS).not.toContain("sourceFileDataBase64");
    expect(ANALYSIS_PUBLIC_COLUMN_KEYS).not.toContain("jobEmbedding");
    expect(ANALYSIS_PUBLIC_COLUMN_KEYS).not.toContain("resumeEmbedding");
    expect(ANALYSIS_PUBLIC_COLUMN_KEYS).toEqual(
      expect.arrayContaining([
        "id",
        "targetRole",
        "selectedTemplateId",
        "jobDescription",
        "parsedResumeText",
        "score",
        "matchedKeywords",
        "missingKeywords",
        "suggestions",
        "extractedProfile",
        "sourceFileName",
        "sourceFileContentType",
        "userId",
      ]),
    );
  });
});
