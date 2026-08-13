import { Inject, Injectable } from "@nestjs/common";

import type { CreateProductEventInput } from "../schemas/product-event.schema.js";
import {
  PRODUCT_EVENTS_REPOSITORY,
  type ProductEventCounts,
  type ProductEventRecord,
  type ProductEventsRepository,
} from "./repositories/product-events.repository.js";

@Injectable()
export class ProductEventsService {
  constructor(
    @Inject(PRODUCT_EVENTS_REPOSITORY)
    private readonly events: ProductEventsRepository,
  ) {}

  /**
   * The payload is already validated by ZodValidationPipe at the controller,
   * so this no longer parses it again as the Express service did.
   */
  async track(userId: string, input: CreateProductEventInput): Promise<ProductEventRecord> {
    return this.events.create({
      userId,
      analysisId: input.analysisId,
      name: input.name,
      metadata: input.metadata ?? null,
    });
  }

  async summarizeForUser(userId: string): Promise<ProductEventCounts> {
    return this.events.countByUser(userId);
  }
}
