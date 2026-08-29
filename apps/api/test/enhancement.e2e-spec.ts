import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types";

import { AiProviderService } from "../src/ai/ai-provider.service.js";
import { AI_SDK } from "../src/ai/ai.module.js";
import { AppModule } from "../src/app.module.js";
import { HttpErrorFilter } from "../src/common/http-error.filter.js";

const TAILOR_INPUT = {
  targetRole: "Backend Engineer",
  jobDescription: "Go, Postgres and Kubernetes experience required.",
  missingKeywords: ["Kubernetes"],
  matchedKeywords: ["Postgres"],
  form: {
    personalInfo: {
      fullName: "Sam Doe",
      email: "sam@example.com",
      phone: "",
      linkedin: "",
      github: "",
      summary: "Backend developer.",
      skills: "Postgres",
    },
    experience: [
      {
        id: "exp_1",
        role: "Backend Engineer",
        location: "",
        dateRange: "",
        bullets: ["Ran the billing service."],
      },
    ],
  },
};

/** Boots the app with the AI gate and SDK stubbed to the given state. */
async function makeApp(options: { enabled: boolean; generateObject?: jest.Mock }) {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(AI_SDK)
    .useValue({ generateObject: options.generateObject ?? jest.fn() })
    .overrideProvider(AiProviderService)
    .useValue({ isEnabled: () => options.enabled, getModel: async () => "mock-model" })
    .compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalFilters(new HttpErrorFilter());
  await app.init();
  return app;
}

describe("Enhancement (e2e)", () => {
  describe("with AI unconfigured", () => {
    let app: INestApplication<App>;

    beforeAll(async () => {
      app = await makeApp({ enabled: false });
    });

    afterAll(async () => {
      await app.close();
    });

    it("refuses bullet enhancement with a 503", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/enhance/bullets")
        .send({ role: "Backend Engineer" })
        .expect(503);

      expect(response.body.error).toBe("AI enhancement is not available.");
    });

    it("still requires a role before checking availability", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/enhance/bullets")
        .send({})
        .expect(400);

      expect(response.body.error).toBe("Role is required.");
    });

    // Tailoring never 503s: it degrades to the rule-based draft.
    it("tailors with the fallback draft", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/enhance/tailor-resume")
        .send(TAILOR_INPUT)
        .expect(201);

      expect(response.body.data.skills.after).toContain("Kubernetes");
      expect(response.body.data.summary.before).toBe("Backend developer.");
    });

    it("rejects a tailor payload missing its form", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/enhance/tailor-resume")
        .send({ targetRole: "x" })
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });
  });

  describe("with AI stubbed", () => {
    let app: INestApplication<App>;
    const generateObject = jest.fn();

    beforeAll(async () => {
      app = await makeApp({ enabled: true, generateObject });
    });

    afterAll(async () => {
      await app.close();
    });

    it("returns the enhanced bullets", async () => {
      generateObject.mockResolvedValueOnce({
        object: { bullets: ["Cut billing incidents by 40% by adding retry logic."] },
      });

      const response = await request(app.getHttpServer())
        .post("/api/enhance/bullets")
        .send({ role: "Backend Engineer", bullets: ["Ran the billing service."] })
        .expect(201);

      expect(response.body.data).toEqual([
        "Cut billing incidents by 40% by adding retry logic.",
      ]);
    });
  });
});
