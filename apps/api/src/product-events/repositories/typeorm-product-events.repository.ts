import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "node:crypto";
import { Repository } from "typeorm";

import { ProductEventEntity } from "../../database/entities/product-event.entity.js";
import type { ProductEventName } from "../../schemas/product-event.schema.js";
import {
  type CreateProductEventRecord,
  emptyCounts,
  type ProductEventCounts,
  type ProductEventRecord,
  type ProductEventsRepository,
} from "./product-events.repository.js";

@Injectable()
export class TypeOrmProductEventsRepository implements ProductEventsRepository {
  constructor(
    @InjectRepository(ProductEventEntity)
    private readonly events: Repository<ProductEventEntity>,
  ) {}

  async create(input: CreateProductEventRecord): Promise<ProductEventRecord> {
    const createdAt = new Date();

    const saved = await this.events.save({
      id: randomUUID(),
      userId: input.userId,
      analysisId: input.analysisId ?? null,
      name: input.name,
      metadata: input.metadata ?? null,
      createdAt,
    });

    return {
      id: saved.id,
      userId: saved.userId,
      analysisId: input.analysisId,
      name: input.name,
      metadata: saved.metadata,
      // The API has always exposed timestamps as ISO strings.
      createdAt: createdAt.toISOString(),
    };
  }

  async countByUser(userId: string): Promise<ProductEventCounts> {
    const rows = await this.events
      .createQueryBuilder("event")
      .select("event.name", "name")
      .addSelect("count(*)::int", "count")
      .where("event.user_id = :userId", { userId })
      .groupBy("event.name")
      .getRawMany<{ name: ProductEventName; count: number }>();

    const counts = emptyCounts();

    for (const row of rows) {
      if (row.name in counts) {
        counts[row.name] = Number(row.count) || 0;
      }
    }

    return counts;
  }
}
