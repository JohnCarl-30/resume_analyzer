import { describe, expect, it } from "vitest";

import { destinationForIntent, isWelcomeComplete } from "../welcome-profile";

describe("destinationForIntent", () => {
  it("sends builders to the scratch builder", () => {
    expect(destinationForIntent("build")).toBe("/create-resume");
  });

  it("sends checkers to a new analysis", () => {
    expect(destinationForIntent("check")).toBe("/analysis/new");
  });
});

describe("isWelcomeComplete", () => {
  it("is false for an account that has never answered", () => {
    expect(isWelcomeComplete(undefined)).toBe(false);
    expect(isWelcomeComplete(null)).toBe(false);
    expect(isWelcomeComplete({})).toBe(false);
    expect(isWelcomeComplete({ welcome: {} })).toBe(false);
  });

  it("is false when the timestamp is not a usable string", () => {
    expect(isWelcomeComplete({ welcome: { completedAt: "" } })).toBe(false);
    expect(isWelcomeComplete({ welcome: { completedAt: 12345 } })).toBe(false);
  });

  it("is true once the questions are answered", () => {
    expect(isWelcomeComplete({ welcome: { completedAt: "2026-08-14T10:00:00.000Z" } })).toBe(true);
  });

  // Skipping writes completedAt too, so the questions are not asked again.
  it("is true after a skip", () => {
    expect(
      isWelcomeComplete({
        welcome: {
          skippedAt: "2026-08-14T10:00:00.000Z",
          completedAt: "2026-08-14T10:00:00.000Z",
        },
      }),
    ).toBe(true);
  });
});
