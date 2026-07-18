import { describe, expect, it } from "vitest";

import { resolveAppOrigins } from "./app-origins.js";

describe("resolveAppOrigins", () => {
  it("includes common localhost dev ports when configured for :3000", () => {
    expect(resolveAppOrigins("http://localhost:3000")).toEqual([
      "http://localhost:3000",
      "https://resumae.tech",
      "https://www.resumae.tech",
      "https://resume-analyzer-chi-gray.vercel.app",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ]);
  });

  it("supports comma-separated configured origins", () => {
    expect(resolveAppOrigins("http://localhost:3000,https://app.example.com")).toEqual([
      "http://localhost:3000",
      "https://app.example.com",
      "https://resumae.tech",
      "https://www.resumae.tech",
      "https://resume-analyzer-chi-gray.vercel.app",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ]);
  });

  it("does not add localhost fallbacks for production origins", () => {
    expect(resolveAppOrigins("https://app.example.com")).toEqual([
      "https://app.example.com",
      "https://resumae.tech",
      "https://www.resumae.tech",
      "https://resume-analyzer-chi-gray.vercel.app",
    ]);
  });
});
