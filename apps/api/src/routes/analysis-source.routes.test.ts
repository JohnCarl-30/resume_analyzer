import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Express } from "express";

const {
  generateObjectMock,
  verifyClerkAccessTokenMock,
  extractTextMock,
} = vi.hoisted(() => ({
  generateObjectMock: vi.fn(),
  verifyClerkAccessTokenMock: vi.fn(),
  extractTextMock: vi.fn(),
}));

vi.mock("../lib/clerk-auth.js", () => ({
  verifyClerkAccessToken: verifyClerkAccessTokenMock,
}));

vi.mock("ai", () => ({
  generateObject: generateObjectMock,
}));

vi.mock("../services/resume-parser.service.js", () => ({
  resumeParserService: {
    isSupportedMimeType: (value: string) => value === "application/pdf",
    extractText: extractTextMock,
  },
}));

vi.mock("../services/resume-extraction.service.js", () => ({
  resumeExtractionService: {
    isEnabled: () => false,
    extractProfile: vi.fn(async () => null),
  },
}));

vi.mock("../db/client.js", () => ({
  db: {
    kind: "drizzle",
    isConfigured: false,
    client: null,
  },
  ensureDatabaseSchema: vi.fn(async () => {}),
}));

import { aiProvider } from "../lib/ai-provider.js";

const sampleResumeText = `
Experienced Software Engineer building scalable web applications.
Managed a team of 5 developers.
Developed a new feature that increased user engagement by 20%.
Proficient in React, Node.js, and TypeScript.
Helped build a new API.
`;

const pdfBytes = Buffer.from("%PDF-1.4 test resume bytes");

async function startTestServer(app: Express): Promise<{ baseUrl: string; close: () => Promise<void> }> {
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

async function uploadAnalysis(baseUrl: string, token?: string) {
  const form = new FormData();
  form.set("targetRole", "Frontend Engineer");
  form.set(
    "jobDescription",
    "We are hiring a Frontend Engineer with React, Node.js, TypeScript, Docker, Kubernetes, and CI/CD experience.",
  );
  form.set("selectedTemplateId", "minimalist-grid");
  form.set("resume", new Blob([pdfBytes], { type: "application/pdf" }), "resume.pdf");

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(`${baseUrl}/api/analysis/upload`, {
    method: "POST",
    headers,
    body: form,
  });
}

describe("POST /api/analysis/upload", () => {
  let testServer: Awaited<ReturnType<typeof startTestServer>>;
  let userCounter = 0;
  let app: Express;

  beforeEach(async () => {
    vi.resetModules();

    userCounter += 1;
    const userId = `upload-test-user-${userCounter}`;

    generateObjectMock.mockReset();
    extractTextMock.mockReset();
    verifyClerkAccessTokenMock.mockReset();
    verifyClerkAccessTokenMock.mockImplementation(async () => userId);
    extractTextMock.mockResolvedValue({
      text: sampleResumeText,
      contentType: "application/pdf",
    });
    vi.spyOn(aiProvider, "isEnabled").mockReturnValue(false);
    vi.spyOn(aiProvider, "getModel").mockReturnValue("mock-model" as never);

    ({ app } = await import("../app.js"));
    testServer = await startTestServer(app);
  });

  afterEach(async () => {
    await testServer.close();
  });

  it("requires sign-in before accepting an upload", async () => {
    const response = await uploadAnalysis(testServer.baseUrl);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Sign in to check your resume.",
    });
  });

  it("persists an uploaded analysis and redeems the account quota", async () => {
    const uploadResponse = await uploadAnalysis(testServer.baseUrl, "owner-token");

    expect(uploadResponse.status).toBe(201);

    const created = (await uploadResponse.json()) as {
      data?: { id?: string; targetRole?: string; score?: number };
    };

    expect(created.data?.id).toBeTruthy();
    expect(created.data?.targetRole).toBe("Frontend Engineer");
    expect(created.data?.score).toBeGreaterThan(0);

    const quotaResponse = await fetch(`${testServer.baseUrl}/api/account/analysis-quota`, {
      headers: {
        Authorization: "Bearer owner-token",
      },
    });

    expect(quotaResponse.status).toBe(200);

    const quota = (await quotaResponse.json()) as {
      data?: { canAnalyze?: boolean; used?: number; analysisId?: string };
    };

    expect(quota.data?.canAnalyze).toBe(false);
    expect(quota.data?.used).toBe(1);
    expect(quota.data?.analysisId).toBe(created.data?.id);
  });

  it("rejects a second upload once the one-analysis quota is redeemed", async () => {
    const firstUpload = await uploadAnalysis(testServer.baseUrl, "owner-token");
    expect(firstUpload.status).toBe(201);

    const secondUpload = await uploadAnalysis(testServer.baseUrl, "owner-token");

    expect(secondUpload.status).toBe(403);

    const payload = (await secondUpload.json()) as { error?: string };
    expect(payload.error).toContain("already used its one resume analysis");
  });
});

describe("GET /api/analysis/:analysisId/source", () => {
  let testServer: Awaited<ReturnType<typeof startTestServer>>;
  let userCounter = 0;
  let app: Express;

  beforeEach(async () => {
    vi.resetModules();

    userCounter += 1;
    const userId = `source-test-user-${userCounter}`;

    generateObjectMock.mockReset();
    extractTextMock.mockReset();
    verifyClerkAccessTokenMock.mockReset();
    verifyClerkAccessTokenMock.mockImplementation(async () => userId);
    extractTextMock.mockResolvedValue({
      text: sampleResumeText,
      contentType: "application/pdf",
    });
    vi.spyOn(aiProvider, "isEnabled").mockReturnValue(false);
    vi.spyOn(aiProvider, "getModel").mockReturnValue("mock-model" as never);

    ({ app } = await import("../app.js"));
    testServer = await startTestServer(app);
  });

  afterEach(async () => {
    await testServer.close();
  });

  it("requires sign-in before returning a saved source file", async () => {
    const uploadResponse = await uploadAnalysis(testServer.baseUrl, "owner-token");
    expect(uploadResponse.status).toBe(201);

    const created = (await uploadResponse.json()) as { data?: { id?: string } };
    const analysisId = created.data?.id;
    expect(analysisId).toBeTruthy();

    const response = await fetch(`${testServer.baseUrl}/api/analysis/${analysisId}/source`);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Sign in to check your resume.",
    });
  });

  it("returns the uploaded PDF bytes for the signed-in owner", async () => {
    const uploadResponse = await uploadAnalysis(testServer.baseUrl, "owner-token");
    expect(uploadResponse.status).toBe(201);

    const created = (await uploadResponse.json()) as { data?: { id?: string } };
    const analysisId = created.data?.id;
    expect(analysisId).toBeTruthy();

    const response = await fetch(`${testServer.baseUrl}/api/analysis/${analysisId}/source`, {
      headers: {
        Authorization: "Bearer owner-token",
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");

    const body = Buffer.from(await response.arrayBuffer());
    expect(body.equals(pdfBytes)).toBe(true);
  });
});
