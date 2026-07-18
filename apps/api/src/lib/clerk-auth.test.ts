import { beforeEach, describe, expect, it, vi } from "vitest";

const envMock = vi.hoisted(() => ({
  CLERK_SECRET_KEY: undefined as string | undefined,
  APP_ORIGIN: "http://localhost:3000",
}));

const { verifyTokenMock } = vi.hoisted(() => ({
  verifyTokenMock: vi.fn(),
}));

vi.mock("../config/env.js", () => ({
  env: envMock,
}));

vi.mock("@clerk/backend", () => ({
  verifyToken: verifyTokenMock,
}));

describe("verifyClerkAccessToken", () => {
  beforeEach(() => {
    vi.resetModules();
    verifyTokenMock.mockReset();
    envMock.CLERK_SECRET_KEY = undefined;
    envMock.APP_ORIGIN = "http://localhost:3000";
  });

  it("returns 503 when Clerk is not configured", async () => {
    const { verifyClerkAccessToken } = await import("./clerk-auth.js");

    await expect(verifyClerkAccessToken("token")).rejects.toMatchObject({
      statusCode: 503,
      message: "Sign-in is not configured on the server yet.",
    });
  });

  it("returns the Clerk subject when token verification succeeds", async () => {
    envMock.CLERK_SECRET_KEY = "sk_test_example";
    verifyTokenMock.mockResolvedValue({ sub: "user_123" });

    const { verifyClerkAccessToken } = await import("./clerk-auth.js");

    await expect(verifyClerkAccessToken("valid-token")).resolves.toBe("user_123");
    expect(verifyTokenMock).toHaveBeenCalledWith("valid-token", {
      secretKey: "sk_test_example",
      authorizedParties: [
        "http://localhost:3000",
        "https://resumae.tech",
        "https://www.resumae.tech",
        "https://resume-analyzer-chi-gray.vercel.app",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
      ],
    });
  });

  it("maps verification failures to an expired-session error", async () => {
    envMock.CLERK_SECRET_KEY = "sk_test_example";
    verifyTokenMock.mockRejectedValue(new Error("invalid signature"));

    const { verifyClerkAccessToken } = await import("./clerk-auth.js");

    await expect(verifyClerkAccessToken("bad-token")).rejects.toMatchObject({
      statusCode: 401,
      message: "Your sign-in session expired. Sign in again.",
    });
  });
});
