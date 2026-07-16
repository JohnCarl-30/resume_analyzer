import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { generateObjectMock, verifySupabaseAccessTokenMock } = vi.hoisted(() => ({
  generateObjectMock: vi.fn(),
  verifySupabaseAccessTokenMock: vi.fn(async () => "test-user-id"),
}));

vi.mock("../lib/supabase-auth.js", () => ({
  verifySupabaseAccessToken: verifySupabaseAccessTokenMock,
}));

vi.mock("ai", () => ({
  generateObject: generateObjectMock,
}));

import { app } from "../app.js";
import { aiProvider } from "../lib/ai-provider.js";

const sampleResumeText = `
Experienced Software Engineer building scalable web applications.
Managed a team of 5 developers.
Developed a new feature that increased user engagement by 20%.
Proficient in React, Node.js, and TypeScript.
Helped build a new API.
`;

const validAnalysisBody = {
  targetRole: "Frontend Engineer",
  jobDescription:
    "We are hiring a Frontend Engineer with React, Node.js, TypeScript, Docker, Kubernetes, and CI/CD experience.",
  resumeText: sampleResumeText,
};

async function startTestServer(): Promise<{ baseUrl: string; close: () => Promise<void> }> {
  const server: Server = createServer(app);

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address() as AddressInfo;

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
  };
}

describe("POST /api/analysis", () => {
  let testServer: Awaited<ReturnType<typeof startTestServer>>;

  beforeEach(async () => {
    generateObjectMock.mockReset();
    verifySupabaseAccessTokenMock.mockClear();
    vi.spyOn(aiProvider, "isEnabled").mockReturnValue(false);
    vi.spyOn(aiProvider, "getModel").mockReturnValue("mock-model" as never);
    testServer = await startTestServer();
  });

  afterEach(async () => {
    await testServer.close();
  });

  it("requires sign-in before analyzing a resume", async () => {
    const response = await fetch(`${testServer.baseUrl}/api/analysis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validAnalysisBody),
    });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Sign in to check your resume.",
    });
  });

  it("returns a resume fit analysis for an authenticated request", async () => {
    const response = await fetch(`${testServer.baseUrl}/api/analysis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      },
      body: JSON.stringify(validAnalysisBody),
    });

    expect(response.status).toBe(201);
    expect(verifySupabaseAccessTokenMock).toHaveBeenCalledWith("test-token");

    const payload = (await response.json()) as {
      data?: {
        targetRole?: string;
        score?: number;
        matchedKeywords?: string[];
        missingKeywords?: string[];
        suggestions?: unknown[];
        generatedAt?: string;
      };
    };

    expect(payload.data?.targetRole).toBe("Frontend Engineer");
    expect(payload.data?.score).toBeGreaterThanOrEqual(20);
    expect(payload.data?.score).toBeLessThanOrEqual(98);
    expect(payload.data?.matchedKeywords?.map((keyword) => keyword.toLowerCase())).toEqual(
      expect.arrayContaining(["react", "node.js", "typescript"]),
    );
    expect(payload.data?.missingKeywords?.map((keyword) => keyword.toLowerCase())).toEqual(
      expect.arrayContaining(["docker", "kubernetes"]),
    );
    expect(payload.data?.suggestions?.length).toBeGreaterThan(0);
    expect(payload.data?.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("rejects invalid analysis payloads", async () => {
    const response = await fetch(`${testServer.baseUrl}/api/analysis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer test-token",
      },
      body: JSON.stringify({
        ...validAnalysisBody,
        resumeText: "too short",
      }),
    });

    expect(response.status).toBe(400);

    const payload = (await response.json()) as { error?: string };
    expect(payload.error).toBe("Validation failed");
  });
});
