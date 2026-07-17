import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getBlobMock } = vi.hoisted(() => ({
  getBlobMock: vi.fn(),
}));

vi.mock("../../../../lib/api-instance", () => ({
  apiClient: {
    getBlob: getBlobMock,
  },
}));

import { loadResumeAnalysisSourcePreview } from "../analysis-api";

describe("loadResumeAnalysisSourcePreview", () => {
  beforeEach(() => {
    getBlobMock.mockReset();
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-preview");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("loads the source file through apiClient and returns blob URLs", async () => {
    getBlobMock.mockResolvedValue({
      blob: new Blob(["%PDF-1.4"], { type: "application/pdf" }),
      contentType: "application/pdf",
    });

    const result = await loadResumeAnalysisSourcePreview("analysis-123");

    expect(getBlobMock).toHaveBeenCalledWith("/api/analysis/analysis-123/source");
    expect(result).toEqual({
      sourceUrl: "blob:mock-preview",
      previewUrl: "blob:mock-preview",
    });
  });

  it("throws when the source request fails", async () => {
    getBlobMock.mockRejectedValue(new Error("Unauthorized"));

    await expect(loadResumeAnalysisSourcePreview("analysis-123")).rejects.toThrow(
      "Unable to load the saved resume file right now.",
    );
  });
});
