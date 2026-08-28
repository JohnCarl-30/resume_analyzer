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

class InMemoryProductEventsRepository implements ProductEventsRepository {
  private readonly events: ProductEventRecord[] = [];

  async create(input: CreateProductEventRecord): Promise<ProductEventRecord> {
    const record: ProductEventRecord = {
      id: crypto.randomUUID(),
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
      if (event.userId !== userId) continue;
      counts[event.name] += 1;
    }
    return counts;
  }
}

export const inMemoryProductEventsRepository = new InMemoryProductEventsRepository();
