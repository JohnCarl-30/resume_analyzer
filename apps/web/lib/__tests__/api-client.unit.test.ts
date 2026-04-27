import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { ApiError, createApiClient } from "../api-client";

describe("createApiClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retries GET request when first success payload is malformed JSON", async () => {
    vi.useFakeTimers();

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("{", { status: 200 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { analysisId: "analysis-1" } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const client = createApiClient({
      baseUrl: "http://localhost:4000",
      maxRetries: 1,
      timeout: 5_000,
    });

    const pending = client.get<{ analysisId: string }>("/api/analysis/analysis-1");

    await vi.advanceTimersByTimeAsync(1_000);

    await expect(pending).resolves.toEqual({ analysisId: "analysis-1" });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("retries GET request when success payload is missing data envelope", async () => {
    vi.useFakeTimers();

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { ok: true } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    const client = createApiClient({
      baseUrl: "http://localhost:4000",
      maxRetries: 1,
      timeout: 5_000,
    });

    const pending = client.get<{ ok: boolean }>("/api/analysis/analysis-1");

    await vi.advanceTimersByTimeAsync(1_000);

    await expect(pending).resolves.toEqual({ ok: true });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("does not retry malformed success payload for POST requests", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{", { status: 200 }));

    const client = createApiClient({
      baseUrl: "http://localhost:4000",
      maxRetries: 2,
      timeout: 5_000,
    });

    await expect(
      client.post<{ ok: boolean }>("/api/analysis", { targetRole: "SE" }),
    ).rejects.toThrow("Malformed JSON response payload");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("preserves validation error field details", async () => {
    const validationPayload = {
      error: "Validation failed",
      details: {
        formErrors: ["Invalid payload"],
        fieldErrors: {
          targetRole: ["Required"],
          jobDescription: undefined,
        },
      },
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(validationPayload), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const client = createApiClient({
      baseUrl: "http://localhost:4000",
      maxRetries: 0,
      timeout: 5_000,
    });

    await expect(client.get("/api/analysis")).rejects.toMatchObject({
      statusCode: 400,
      message: "Invalid payload",
      fieldErrors: {
        targetRole: ["Required"],
      },
      formErrors: ["Invalid payload"],
    });
  });
});
