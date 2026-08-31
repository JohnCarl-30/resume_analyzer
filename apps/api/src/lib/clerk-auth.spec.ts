// Ported from the vitest suite that stopped running at the Jest switch.
// require() rather than dynamic import(): the module captures the env at load
// time, so each case reloads it -- and Jest's CommonJS VM cannot execute a
// real dynamic import.

const mockEnv: { CLERK_SECRET_KEY: string | undefined; APP_ORIGIN: string } = {
  CLERK_SECRET_KEY: undefined,
  APP_ORIGIN: "http://localhost:3000",
};
const mockVerifyToken = jest.fn();

jest.mock("../config/env.js", () => ({ env: mockEnv }));
jest.mock("@clerk/backend", () => ({ verifyToken: mockVerifyToken }));

function unsignedJwt(payload: Record<string, unknown>) {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.sig`;
}

function loadModule(): typeof import("./clerk-auth.js") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./clerk-auth.js") as typeof import("./clerk-auth.js");
}

describe("verifyClerkAccessToken", () => {
  beforeEach(() => {
    jest.resetModules();
    mockVerifyToken.mockReset();
    mockEnv.CLERK_SECRET_KEY = undefined;
    mockEnv.APP_ORIGIN = "http://localhost:3000";
  });

  it("returns 503 when Clerk is not configured", async () => {
    const { verifyClerkAccessToken } = loadModule();

    await expect(verifyClerkAccessToken("token")).rejects.toMatchObject({
      statusCode: 503,
      message: "Sign-in is not configured on the server yet.",
    });
  });

  it("skips authorizedParties when the token has no azp claim", async () => {
    mockEnv.CLERK_SECRET_KEY = "sk_test_example";
    mockVerifyToken.mockResolvedValue({ sub: "user_123" });
    const token = unsignedJwt({ sub: "user_123" });

    const { verifyClerkAccessToken } = loadModule();

    await expect(verifyClerkAccessToken(token)).resolves.toBe("user_123");
    expect(mockVerifyToken).toHaveBeenCalledWith(token, {
      secretKey: "sk_test_example",
    });
  });

  it("enforces authorizedParties when the token includes azp", async () => {
    mockEnv.CLERK_SECRET_KEY = "sk_test_example";
    mockVerifyToken.mockResolvedValue({ sub: "user_123", azp: "http://localhost:3000" });
    const token = unsignedJwt({ sub: "user_123", azp: "http://localhost:3000" });

    const { verifyClerkAccessToken } = loadModule();

    await expect(verifyClerkAccessToken(token)).resolves.toBe("user_123");
    expect(mockVerifyToken).toHaveBeenCalledWith(token, {
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
    mockEnv.CLERK_SECRET_KEY = "sk_test_example";
    mockVerifyToken.mockRejectedValue(new Error("invalid signature"));

    const { verifyClerkAccessToken } = loadModule();

    await expect(verifyClerkAccessToken("bad-token")).rejects.toMatchObject({
      statusCode: 401,
      message: "Your sign-in session expired. Sign in again.",
    });
  });
});
