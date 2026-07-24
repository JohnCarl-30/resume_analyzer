import type { ProductEventName } from "../schemas/product-event.schema.js";

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
