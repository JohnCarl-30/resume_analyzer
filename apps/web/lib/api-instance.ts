import { createApiClient } from "./api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export const apiClient = createApiClient({
  baseUrl: API_BASE_URL,
  timeout: 30_000,
  maxRetries: 3,
  debug: process.env.NODE_ENV === "development",
});
