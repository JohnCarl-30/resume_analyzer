import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types";

import { AppModule } from "../src/app.module.js";
import { HttpErrorFilter } from "../src/common/http-error.filter.js";

const PROTECTED_ROUTES = [
  { method: "get" as const, path: "/api/events/summary" },
  { method: "post" as const, path: "/api/events" },
];

/**
 * The guard is deliberately NOT overridden here.
 *
 * Every other e2e spec replaces it so it can exercise a route as a signed-in
 * user, which means none of them prove that an anonymous request is actually
 * turned away. This suite covers that boundary with the real guard in place.
 */
describe("Authentication (e2e)", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new HttpErrorFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe.each(PROTECTED_ROUTES)("$method $path", ({ method, path }) => {
    it("rejects a request with no Authorization header", async () => {
      const response = await request(app.getHttpServer())[method](path).expect(401);

      expect(response.body.error).toBe("Sign in to check your resume.");
    });

    it("rejects a header that is not a bearer token", async () => {
      const response = await request(app.getHttpServer())
        [method](path)
        .set("Authorization", "Basic abc123")
        .expect(401);

      expect(response.body.error).toBe("Sign in to check your resume.");
    });

    it("rejects a bearer header with no token", async () => {
      await request(app.getHttpServer())
        [method](path)
        .set("Authorization", "Bearer    ")
        .expect(401);
    });

    // A token cannot be checked without a Clerk key, and that is the server's
    // gap rather than the caller's -- so it is a 503, not a 401.
    it("reports 503 when the server has no Clerk key", async () => {
      const response = await request(app.getHttpServer())
        [method](path)
        .set("Authorization", "Bearer some-token")
        .expect(503);

      expect(response.body.error).toBe("Sign-in is not configured on the server yet.");
    });
  });

  it("leaves public routes reachable", async () => {
    await request(app.getHttpServer()).get("/health").expect(200);
  });
});
