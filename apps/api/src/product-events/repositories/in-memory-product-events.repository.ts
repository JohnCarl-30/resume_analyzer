import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";

import {
  type CreateProductEventRecord,
  emptyCounts,
  type ProductEventCounts,
  type ProductEventRecord,
  type ProductEventsRepository,
} from "./product-events.repository.js";

/** Used when no database is configured. Events are lost when the process ends. */
@Injectable()
export class InMemoryProductEventsRepository implements ProductEventsRepository {
  private readonly events: ProductEventRecord[] = [];

  async create(input: CreateProductEventRecord): Promise<ProductEventRecord> {
    const record: ProductEventRecord = {
      id: randomUUID(),
      userId: input.userId,
      analysisId: input.analysisId,
      name: input.name,
      metadata: input.metadata ?? null,
      createdAt: new Date().toISOString(),
    };

    this.events.push(record);
    return record;
  }

  async countByUser(userId: string): Promise<ProductEventCounts> {
    const counts = emptyCounts();

    for (const event of this.events) {
      if (event.userId === userId) {
        counts[event.name] += 1;
      }
    }

    return counts;
  }
}
