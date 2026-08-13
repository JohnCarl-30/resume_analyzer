import { type DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { DatabaseModule } from "../database/database.module.js";
import { ProductEventEntity } from "../database/entities/product-event.entity.js";
import { ProductEventsController } from "./product-events.controller.js";
import { ProductEventsService } from "./product-events.service.js";
import { InMemoryProductEventsRepository } from "./repositories/in-memory-product-events.repository.js";
import { PRODUCT_EVENTS_REPOSITORY } from "./repositories/product-events.repository.js";
import { TypeOrmProductEventsRepository } from "./repositories/typeorm-product-events.repository.js";

/**
 * Registered as a dynamic module because the repository implementation is
 * chosen at startup: Postgres when DATABASE_URL is set, in-memory otherwise.
 * This replaces the `db.isConfigured ? postgres : inMemory` ternary the
 * services used to evaluate at import time.
 */
@Module({})
export class ProductEventsModule {
  static register(): DynamicModule {
    const usePostgres = DatabaseModule.isConfigured;

    return {
      module: ProductEventsModule,
      imports: usePostgres ? [TypeOrmModule.forFeature([ProductEventEntity])] : [],
      controllers: [ProductEventsController],
      providers: [
        ProductEventsService,
        {
          provide: PRODUCT_EVENTS_REPOSITORY,
          useClass: usePostgres
            ? TypeOrmProductEventsRepository
            : InMemoryProductEventsRepository,
        },
      ],
    };
  }
}
