import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types";

import { AppModule } from "../src/app.module.js";

/**
 * Boots the whole application, so these cover routing, module wiring and the
 * response shapes a client actually sees -- the things unit tests mock away.
 *
 * Route coverage grows here as modules are ported from Hono. Until then the
 * only mapped route is health, and everything else is expected to 404.
 */
describe("API (e2e)", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /health", () => {
    it("reports ok", async () => {
      await request(app.getHttpServer())
        .get("/health")
        .expect(200)
        .expect({ status: "ok" });
    });
  });

  describe("routes that are absent", () => {
    // Every surviving route is ported now. These two were removed outright:
    // unauthenticated endpoints that nothing called (an unscoped resume list
    // and an anonymous R2 presign).
    it.each(["/api/uploads/sign", "/api/resumes"])(
      "%s returns 404",
      async (path) => {
        await request(app.getHttpServer()).get(path).expect(404);
      },
    );
  });

  it("returns 404 for an unknown route", async () => {
    await request(app.getHttpServer()).get("/definitely-not-a-route").expect(404);
  });
});
