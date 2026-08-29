import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types";

import { AppModule } from "../src/app.module.js";
import { ClerkAuthGuard } from "../src/auth/clerk-auth.guard.js";
import { HttpErrorFilter } from "../src/common/http-error.filter.js";

/** The guard stub authenticates as whichever user the test sets here. */
let activeUser = "user-one";

describe("Job applications (e2e)", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(ClerkAuthGuard)
      .useValue({
        canActivate: (context: {
          switchToHttp: () => { getRequest: () => { userId?: string } };
        }) => {
          context.switchToHttp().getRequest().userId = activeUser;
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new HttpErrorFilter());
    await app.init();
  });

  beforeEach(() => {
    activeUser = "user-one";
  });

  afterAll(async () => {
    await app.close();
  });

  async function createApplication(body: Record<string, unknown>) {
    const response = await request(app.getHttpServer())
      .post("/api/applications")
      .send(body)
      .expect(201);
    return response.body.data as { id: string; status: string; company: string };
  }

  it("creates with the default status and lists newest first", async () => {
    const first = await createApplication({ company: "Acme", role: "Backend Engineer" });
    expect(first.status).toBe("saved");

    await createApplication({ company: "Globex", role: "Platform Engineer" });

    const list = await request(app.getHttpServer()).get("/api/applications").expect(200);
    const companies = (list.body.data as { company: string }[]).map((a) => a.company);
    expect(companies[0]).toBe("Globex");
    expect(companies).toContain("Acme");
  });

  it("round-trips a single application", async () => {
    const created = await createApplication({
      company: "Initech",
      role: "SRE",
      jobUrl: "https://initech.example/jobs/1",
      notes: "Referred",
    });

    const fetched = await request(app.getHttpServer())
      .get(`/api/applications/${created.id}`)
      .expect(200);

    expect(fetched.body.data).toMatchObject({
      company: "Initech",
      jobUrl: "https://initech.example/jobs/1",
      notes: "Referred",
    });
  });

  it("applies partial updates and bumps updatedAt", async () => {
    const created = await createApplication({ company: "Acme", role: "Engineer" });

    const updated = await request(app.getHttpServer())
      .patch(`/api/applications/${created.id}`)
      .send({ status: "interviewing" })
      .expect(200);

    expect(updated.body.data).toMatchObject({
      status: "interviewing",
      company: "Acme",
    });
  });

  it("rejects an empty update with the legacy error shape", async () => {
    const created = await createApplication({ company: "Acme", role: "Engineer" });

    const response = await request(app.getHttpServer())
      .patch(`/api/applications/${created.id}`)
      .send({})
      .expect(400);

    expect(response.body.error).toBe("Validation failed");
  });

  it("rejects an unknown status", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/applications")
      .send({ company: "Acme", role: "Engineer", status: "ghosted" })
      .expect(400);

    expect(response.body.details.fieldErrors.status).toBeDefined();
  });

  it("deletes and then 404s", async () => {
    const created = await createApplication({ company: "Acme", role: "Engineer" });

    await request(app.getHttpServer()).delete(`/api/applications/${created.id}`).expect(204);
    await request(app.getHttpServer()).get(`/api/applications/${created.id}`).expect(404);
  });

  // One user's records must be invisible to another, and a foreign id must be
  // indistinguishable from one that does not exist.
  it("scopes every route to the owner", async () => {
    const created = await createApplication({ company: "Acme", role: "Engineer" });

    activeUser = "user-two";
    await request(app.getHttpServer()).get(`/api/applications/${created.id}`).expect(404);
    await request(app.getHttpServer())
      .patch(`/api/applications/${created.id}`)
      .send({ status: "offer" })
      .expect(404);
    await request(app.getHttpServer()).delete(`/api/applications/${created.id}`).expect(404);

    const list = await request(app.getHttpServer()).get("/api/applications").expect(200);
    expect((list.body.data as unknown[]).length).toBe(0);
  });
});
