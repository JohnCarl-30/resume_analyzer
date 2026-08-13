// reflect-metadata must be imported before any decorated class is loaded,
// because Nest's dependency injection reads the metadata it emits.
import "reflect-metadata";

import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module.js";
import { HttpErrorFilter } from "./common/http-error.filter.js";
import { env } from "./config/env.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Preserves the Express response shapes the web app parses.
  app.useGlobalFilters(new HttpErrorFilter());
  app.enableShutdownHooks();

  await app.listen(env.PORT);
  Logger.log(`API listening on http://localhost:${env.PORT}`, "Bootstrap");
}

void bootstrap();
