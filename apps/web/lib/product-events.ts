import { apiClient } from "@/lib/api-instance";

export type ProductEventName =
  | "resume_print"
  | "resume_export_json"
  | "resume_download_original";

export interface TrackProductEventInput {
  name: ProductEventName;
  analysisId?: string;
  metadata?: Record<string, unknown>;
}

export interface ProductEventCounts {
  resume_print: number;
  resume_export_json: number;
  resume_download_original: number;
}

/** Fire-and-forget product analytics — never blocks print/export UX. */
export function trackProductEvent(input: TrackProductEventInput): void {
  void apiClient.post("/api/events", input).catch(() => {
    // Ignore network / auth failures; metrics are best-effort.
  });
}

export function fetchProductEventSummary() {
  return apiClient.get<ProductEventCounts>("/api/events/summary");
}
