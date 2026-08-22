import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types";

import { AppModule } from "../src/app.module.js";
import { ClerkAuthGuard } from "../src/auth/clerk-auth.guard.js";
import { HttpErrorFilter } from "../src/common/http-error.filter.js";

const USER_ID = "user_test_123";

describe("Product events (e2e)", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Clerk is not reachable from tests, so the guard is replaced with one
      // that authenticates every request as a fixed user.
      .overrideGuard(ClerkAuthGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => { getRequest: () => { userId?: string } };
        }) => {
          context.switchToHttp().getRequest().userId = USER_ID;
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new HttpErrorFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("records an event and counts it in the summary", async () => {
    const created = await request(app.getHttpServer())
      .post("/api/events")
      .send({ name: "resume_print" })
      .expect(201);

    expect(created.body.data).toMatchObject({ userId: USER_ID, name: "resume_print" });
    expect(created.body.data.id).toEqual(expect.any(String));

    const summary = await request(app.getHttpServer())
      .get("/api/events/summary")
      .expect(200);

    expect(summary.body.data).toMatchObject({ resume_print: 1 });
  });

  it("accepts optional analysisId and metadata", async () => {
    const created = await request(app.getHttpServer())
      .post("/api/events")
      .send({
        name: "resume_export_json",
        analysisId: "analysis-1",
        metadata: { template: "harvard" },
      })
      .expect(201);

    expect(created.body.data).toMatchObject({
      analysisId: "analysis-1",
      metadata: { template: "harvard" },
    });
  });

  describe("validation", () => {
    // The web app reads details.fieldErrors to show per-field messages, so the
    // failure body has to keep the shape the Express API returned.
    it("rejects an unknown event name with the legacy error shape", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/events")
        .send({ name: "not_a_real_event" })
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
      expect(response.body.details.fieldErrors.name).toBeDefined();
    });

    it("rejects an empty body", async () => {
      await request(app.getHttpServer()).post("/api/events").send({}).expect(400);
    });

    // Express leaves a malformed body as {} rather than throwing, so this has
    // to come back as a validation failure, not a 500.
    it("rejects a malformed JSON body", async () => {
      await request(app.getHttpServer())
        .post("/api/events")
        .set("Content-Type", "application/json")
        .send('{"name":')
        .expect(400);
    });

    it("ignores unknown fields rather than rejecting them", async () => {
      const created = await request(app.getHttpServer())
        .post("/api/events")
        .send({ name: "resume_print", somethingElse: "ignored" })
        .expect(201);

      expect(created.body.data).not.toHaveProperty("somethingElse");
    });
  });
});
