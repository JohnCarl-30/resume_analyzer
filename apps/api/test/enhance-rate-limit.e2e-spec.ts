import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types";

import { AiProviderService } from "../src/ai/ai-provider.service.js";
import { AI_SDK } from "../src/ai/ai.module.js";
import { AppModule } from "../src/app.module.js";
import { HttpErrorFilter } from "../src/common/http-error.filter.js";

const LIMIT = 10;

/**
 * These routes are unauthenticated on purpose, so the rate limit is the only
 * thing standing between an anonymous caller and unbounded OpenAI spend.
 */
describe("Enhance rate limiting (e2e)", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(AI_SDK)
      .useValue({
        generateObject: jest.fn().mockResolvedValue({ object: { bullets: ["ok"] } }),
      })
      .overrideProvider(AiProviderService)
      .useValue({ isEnabled: () => true, getModel: async () => "mock-model" })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new HttpErrorFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("serves a burst up to the limit, then answers 429", async () => {
    const send = (ip: string) =>
      request(app.getHttpServer())
        .post("/api/enhance/bullets")
        .set("X-Forwarded-For", ip)
        .send({ role: "Backend Engineer" });

    for (let i = 0; i < LIMIT; i += 1) {
      await send("203.0.113.10").expect(201);
    }

    await send("203.0.113.10").expect(429);
  });

  // Behind Azure ingress every request carries the proxy's address, so a
  // tracker keyed on req.ip would throttle unrelated callers together.
  it("keeps one caller's burst away from another's allowance", async () => {
    await request(app.getHttpServer())
      .post("/api/enhance/bullets")
      .set("X-Forwarded-For", "203.0.113.99")
      .send({ role: "Backend Engineer" })
      .expect(201);
  });

  it("reads the original client from the forwarded chain", async () => {
    // Azure appends its hop, so the left-most entry is the real client.
    await request(app.getHttpServer())
      .post("/api/enhance/bullets")
      .set("X-Forwarded-For", "198.51.100.7, 10.0.0.1")
      .send({ role: "Backend Engineer" })
      .expect(201);
  });
});
