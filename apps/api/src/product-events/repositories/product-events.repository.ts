import type { ProductEventName } from "../../schemas/product-event.schema.js";

export interface ProductEventRecord {
  id: string;
  userId: string;
  analysisId?: string;
  name: ProductEventName;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface CreateProductEventRecord {
  userId: string;
  analysisId?: string;
  name: ProductEventName;
  metadata?: Record<string, unknown> | null;
}

export interface ProductEventCounts {
  resume_print: number;
  resume_export_json: number;
  resume_download_original: number;
}

export interface ProductEventsRepository {
  create(input: CreateProductEventRecord): Promise<ProductEventRecord>;
  countByUser(userId: string): Promise<ProductEventCounts>;
}

/** Injection token: the implementation depends on whether Postgres is configured. */
export const PRODUCT_EVENTS_REPOSITORY = Symbol("PRODUCT_EVENTS_REPOSITORY");

export function emptyCounts(): ProductEventCounts {
  return {
    resume_print: 0,
    resume_export_json: 0,
    resume_download_original: 0,
  };
}
