import { describe, expect, it } from "vitest";

import { resolveSafeRedirectPath } from "../auth-redirect";

describe("resolveSafeRedirectPath", () => {
  it("returns the fallback for missing or unsafe paths", () => {
    expect(resolveSafeRedirectPath(null)).toBe("/home");
    expect(resolveSafeRedirectPath("https://evil.test")).toBe("/home");
    expect(resolveSafeRedirectPath("//evil.test")).toBe("/home");
  });

  it("returns safe internal paths", () => {
    expect(resolveSafeRedirectPath("/history")).toBe("/history");
    expect(resolveSafeRedirectPath("/analysis/new")).toBe("/analysis/new");
  });
});
