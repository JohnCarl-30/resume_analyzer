import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { HealthController } from "./health/health.controller.js";

/**
 * Root module.
 *
 * Feature modules are added here as the API is ported from Hono, smallest
 * first. Anything not yet ported has no route and returns 404 -- the port is
 * a single cutover, so nothing is served from the old stack in the meantime.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // The API already loads .env through dotenv at import time; this keeps
      // ConfigService reading the same values rather than a second source.
      envFilePath: [".env"],
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
