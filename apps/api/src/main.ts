// reflect-metadata must be imported before any decorated class is loaded,
// because Nest's dependency injection reads the metadata it emits.
import "reflect-metadata";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module.js";
import { resolveAppOrigins } from "./config/app-origins.js";
import { HttpErrorFilter } from "./common/http-error.filter.js";
import { env } from "./config/env.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Origins are resolved per request so APP_ORIGIN changes take effect
  // without a restart, matching the Hono and Express apps before this one.
  // Without this block no browser can call the API at all -- the Hono app
  // carried its own cors() middleware and the port had silently dropped it.
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || resolveAppOrigins().includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  });

  // Preserves the Express response shapes the web app parses.
  app.useGlobalFilters(new HttpErrorFilter());
  app.enableShutdownHooks();

  await app.listen(env.PORT);
  Logger.log(`API listening on http://localhost:${env.PORT}`, "Bootstrap");
}

void bootstrap();
