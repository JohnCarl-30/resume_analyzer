import { describe, expect, it, vi } from "vitest";

import {
  getAccessToken,
  notifyUnauthorized,
  setAccessTokenGetter,
  setUnauthorizedHandler,
} from "../auth-token";

describe("auth-token", () => {
  it("reads tokens from the configured getter", async () => {
    setAccessTokenGetter(async () => "token-123");

    await expect(getAccessToken()).resolves.toBe("token-123");
  });

  it("notifies the unauthorized handler when a request is rejected", () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);

    notifyUnauthorized();

    expect(handler).toHaveBeenCalledTimes(1);
  });
});
