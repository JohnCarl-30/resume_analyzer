import { type DynamicModule, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { env } from "../config/env.js";
import { dataSourceOptions } from "./data-source.js";

/**
 * Connects to Postgres only when DATABASE_URL is set.
 *
 * The API is expected to run without a database -- feature modules fall back
 * to in-memory repositories -- so importing TypeOrmModule unconditionally
 * would make an unconfigured environment fail at boot instead of degrading.
 */
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    if (!env.DATABASE_URL) {
      return { module: DatabaseModule };
    }

    return {
      module: DatabaseModule,
      imports: [TypeOrmModule.forRoot(dataSourceOptions)],
      exports: [TypeOrmModule],
    };
  }

  /** True when feature modules should wire their Postgres repositories. */
  static get isConfigured(): boolean {
    return Boolean(env.DATABASE_URL);
  }
}
