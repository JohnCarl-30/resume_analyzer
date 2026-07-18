import { describe, expect, it } from "vitest";

import {
  formatSavedCheckDate,
  getFirstName,
  getHomeMastheadEyebrow,
  getHomeMastheadHeadline,
  getInitials,
  savedCheckRowLabel,
  scoreToneClass,
} from "../home-display";

describe("getInitials", () => {
  it("uses first letters of first and last name", () => {
    expect(getInitials("Alex Example")).toBe("AE");
  });

  it("uses the first two characters of a single name", () => {
    expect(getInitials("Alex")).toBe("AL");
  });

  it("returns a question mark when the name is blank", () => {
    expect(getInitials("   ")).toBe("?");
  });
});

describe("getFirstName", () => {
  it("returns the first word of a display name", () => {
    expect(getFirstName("Alex Example")).toBe("Alex");
  });

  it("returns null for the placeholder account label", () => {
    expect(getFirstName("Your account")).toBeNull();
  });
});

describe("getHomeMastheadHeadline", () => {
  it("prompts for a new match when a check is available", () => {
    expect(getHomeMastheadHeadline("", true)).toBe("Ready for your next match?");
  });

  it("reflects a saved check when quota is used", () => {
    expect(getHomeMastheadHeadline("", false)).toBe("Your check is saved");
  });

  it("surfaces plan errors", () => {
    expect(getHomeMastheadHeadline("Could not load plan", true)).toBe(
      "Plan status unavailable",
    );
  });
});

describe("getHomeMastheadEyebrow", () => {
  it("uses workspace when a check is available", () => {
    expect(getHomeMastheadEyebrow("", true)).toBe("Workspace");
  });

  it("uses saved check when quota is exhausted", () => {
    expect(getHomeMastheadEyebrow("", false)).toBe("Saved check");
  });
});

describe("formatSavedCheckDate", () => {
  it("formats a valid ISO date for display", () => {
    expect(formatSavedCheckDate("2026-01-15T12:00:00.000Z")).toBe("Jan 15, 2026");
  });

  it("returns Recent when the date is invalid", () => {
    expect(formatSavedCheckDate("not-a-date")).toBe("Recent");
  });
});

describe("scoreToneClass", () => {
  it("marks strong scores as foreground", () => {
    expect(scoreToneClass(75)).toBe("text-foreground");
  });

  it("marks mid scores as muted", () => {
    expect(scoreToneClass(50)).toBe("text-muted-foreground");
  });

  it("marks weak scores as destructive", () => {
    expect(scoreToneClass(49)).toBe("text-destructive");
  });
});

describe("savedCheckRowLabel", () => {
  it("builds an accessible label for a saved check row", () => {
    expect(
      savedCheckRowLabel({
        fileName: "resume.pdf",
        score: 82,
        targetRole: "Frontend Engineer",
        uploadedAt: "2026-01-15T12:00:00.000Z",
      }),
    ).toBe("Open resume.pdf, 82% match, Frontend Engineer, Jan 15, 2026");
  });

  it("falls back when target role is missing", () => {
    expect(
      savedCheckRowLabel({
        fileName: "resume.pdf",
        score: 40,
        targetRole: "",
        uploadedAt: "bad",
      }),
    ).toBe("Open resume.pdf, 40% match, Target role not set, Recent");
  });
});
