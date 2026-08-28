import { eq, sql } from "drizzle-orm";

import { db } from "../db/client.js";
import { productEventsTable } from "../db/schema.js";
import type { ProductEventName } from "../schemas/product-event.schema.js";
import type {
  CreateProductEventRecord,
  ProductEventCounts,
  ProductEventRecord,
  ProductEventsRepository,
} from "./product-events.repository.js";

const emptyCounts = (): ProductEventCounts => ({
  resume_print: 0,
  resume_export_json: 0,
  resume_download_original: 0,
});

class PostgresProductEventsRepository implements ProductEventsRepository {
  async create(input: CreateProductEventRecord): Promise<ProductEventRecord> {
    if (!db.client) {
      throw new Error("Database client is not configured.");
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await db.client.insert(productEventsTable).values({
      id,
      userId: input.userId,
      analysisId: input.analysisId ?? null,
      name: input.name,
      metadata: input.metadata ?? null,
      createdAt,
    });

    return {
      id,
      userId: input.userId,
      analysisId: input.analysisId,
      name: input.name,
      metadata: input.metadata ?? null,
      createdAt,
    };
  }

  async countByUser(userId: string): Promise<ProductEventCounts> {
    if (!db.client) {
      return emptyCounts();
    }

    const rows = await db.client
      .select({
        name: productEventsTable.name,
        count: sql<number>`count(*)::int`,
      })
      .from(productEventsTable)
      .where(eq(productEventsTable.userId, userId))
      .groupBy(productEventsTable.name);

    const counts = emptyCounts();
    for (const row of rows) {
      const name = row.name as ProductEventName;
      if (name in counts) {
        counts[name] = Number(row.count) || 0;
      }
    }
    return counts;
  }
}

export const postgresProductEventsRepository = new PostgresProductEventsRepository();
