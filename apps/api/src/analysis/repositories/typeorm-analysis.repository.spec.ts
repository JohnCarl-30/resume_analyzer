import { PUBLIC_COLUMNS } from "./typeorm-analysis.repository.js";

// Ported from the vitest suite that stopped running at the Jest switch.
describe("analysis public columns", () => {
  const keys = Object.keys(PUBLIC_COLUMNS);

  it("excludes the PDF blob and embedding columns from public reads", () => {
    expect(keys).not.toContain("sourceFileDataBase64");
    expect(keys).not.toContain("jobEmbedding");
    expect(keys).not.toContain("resumeEmbedding");
  });

  it("keeps every column the analysis JSON needs", () => {
    expect(keys).toEqual(
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
        "generatedAt",
        "userId",
        "createdAt",
      ]),
    );
  });
});
