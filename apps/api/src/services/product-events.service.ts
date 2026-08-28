import { db } from "../db/client.js";
import { inMemoryProductEventsRepository } from "../repositories/in-memory-product-events.repository.js";
import { postgresProductEventsRepository } from "../repositories/postgres-product-events.repository.js";
import {
  createProductEventSchema,
  type CreateProductEventInput,
} from "../schemas/product-event.schema.js";

const productEventsRepository = db.isConfigured
  ? postgresProductEventsRepository
  : inMemoryProductEventsRepository;

export const productEventsService = {
  async track(userId: string, input: unknown) {
    const payload: CreateProductEventInput = createProductEventSchema.parse(input);

    return productEventsRepository.create({
      userId,
      analysisId: payload.analysisId,
      name: payload.name,
      metadata: payload.metadata ?? null,
    });
  },

  async summarizeForUser(userId: string) {
    return productEventsRepository.countByUser(userId);
  },
};
