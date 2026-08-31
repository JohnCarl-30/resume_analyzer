import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types";

import { AppModule } from "../src/app.module.js";
import { ClerkAuthGuard } from "../src/auth/clerk-auth.guard.js";
import { HttpErrorFilter } from "../src/common/http-error.filter.js";

let activeUser = "analysis-user-one";

const RESUME_TEXT = `Jordan Lee — Backend Engineer
Experience
Built Node.js services handling background jobs with PostgreSQL and Redis.
Cut deploy time by 40% by introducing CI caching for Docker builds.
Skills
TypeScript, Node.js, PostgreSQL, Docker, CI/CD`;

const JOB_DESCRIPTION = `We are hiring a Backend Engineer with strong TypeScript and Node.js
experience. PostgreSQL, Docker and Kubernetes are required. CI/CD experience preferred.`;

/**
 * No AI key is configured under e2e, so the pipeline runs its deterministic
 * rule-based path end to end -- JD keyword extraction falls back, scoring
 * comes from the analyzers. That makes a full create-and-read flow testable
 * without stubbing anything.
 */
describe("Analysis (e2e)", () => {
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
    activeUser = "analysis-user-one";
  });

  afterAll(async () => {
    await app.close();
  });

  it("scores a resume against a job post without persisting", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/analysis")
      .send({
        targetRole: "Backend Engineer",
        jobDescription: JOB_DESCRIPTION,
        resumeText: RESUME_TEXT,
      })
      .expect(201);

    const analysis = response.body.data;
    expect(analysis.score).toEqual(expect.any(Number));
    expect(analysis.matchedKeywords.length).toBeGreaterThan(0);
    expect(analysis.suggestions.length).toBeGreaterThan(0);
    expect(analysis.id).toBeUndefined();
  });

  it("rejects a too-short job description with the legacy shape", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/analysis")
      .send({ targetRole: "Engineer", jobDescription: "short", resumeText: RESUME_TEXT })
      .expect(400);

    expect(response.body.error).toBe("Validation failed");
    expect(response.body.details.fieldErrors.jobDescription).toBeDefined();
  });

  it("persists a template analysis, spends the quota, and reads it back", async () => {
    activeUser = "analysis-quota-user";

    const created = await request(app.getHttpServer())
      .post("/api/analysis/template")
      .send({
        targetRole: "Backend Engineer",
        jobDescription: JOB_DESCRIPTION,
        resumeText: RESUME_TEXT,
        selectedTemplateId: "harvard-classic",
      })
      .expect(201);

    const analysis = created.body.data;
    expect(analysis.id).toEqual(expect.any(String));
    expect(analysis.selectedTemplateId).toBe("harvard-classic");
    expect(analysis.extractionProvider).toBe("parser");

    const fetched = await request(app.getHttpServer())
      .get(`/api/analysis/${analysis.id}`)
      .expect(200);
    expect(fetched.body.data.parsedResumeText).toBe(RESUME_TEXT);

    const quota = await request(app.getHttpServer())
      .get("/api/account/analysis-quota")
      .expect(200);
    expect(quota.body.data).toMatchObject({ used: 1, analysisId: analysis.id });

    // The free check is spent, so a second attempt is refused before any work.
    const refused = await request(app.getHttpServer())
      .post("/api/analysis/template")
      .send({
        targetRole: "Backend Engineer",
        jobDescription: JOB_DESCRIPTION,
        resumeText: RESUME_TEXT,
      })
      .expect(403);
    expect(refused.body.error).toContain("already used its one resume analysis");
  });

  it("re-analyses a saved check against a new job post", async () => {
    activeUser = "analysis-update-user";

    const created = await request(app.getHttpServer())
      .post("/api/analysis/template")
      .send({
        targetRole: "Backend Engineer",
        jobDescription: JOB_DESCRIPTION,
        resumeText: RESUME_TEXT,
      })
      .expect(201);

    const updated = await request(app.getHttpServer())
      .patch(`/api/analysis/${created.body.data.id}`)
      .send({
        jobDescription:
          "Seeking a Platform Engineer. Kubernetes, Terraform and Go required. On-call rotation.",
        targetRole: "Platform Engineer",
      })
      .expect(200);

    expect(updated.body.data.targetRole).toBe("Platform Engineer");
    expect(updated.body.data.id).toBe(created.body.data.id);
  });

  it("hides another user's analysis", async () => {
    activeUser = "analysis-owner";
    const created = await request(app.getHttpServer())
      .post("/api/analysis/template")
      .send({
        targetRole: "Backend Engineer",
        jobDescription: JOB_DESCRIPTION,
        resumeText: RESUME_TEXT,
      })
      .expect(201);

    activeUser = "analysis-stranger";
    await request(app.getHttpServer())
      .get(`/api/analysis/${created.body.data.id}`)
      .expect(404);

    const list = await request(app.getHttpServer()).get("/api/analysis").expect(200);
    expect((list.body.data as unknown[]).length).toBe(0);
  });

  it("rejects an unsupported upload type with the legacy wording", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/analysis/upload")
      .field("targetRole", "Backend Engineer")
      .field("jobDescription", JOB_DESCRIPTION)
      .attach("resume", Buffer.from("plain text"), {
        filename: "resume.txt",
        contentType: "text/plain",
      })
      .expect(400);

    expect(response.body.error).toBe("Please upload a PDF or DOCX resume so we can parse it.");
  });

  it("requires a file on the upload route", async () => {
    const response = await request(app.getHttpServer())
      .post("/api/analysis/upload")
      .field("targetRole", "Backend Engineer")
      .field("jobDescription", JOB_DESCRIPTION)
      .expect(400);

    expect(response.body.error).toBe("Please upload a PDF or DOCX resume.");
  });

  it("serves the public evaluate and examples routes without auth", async () => {
    const evaluated = await request(app.getHttpServer())
      .post("/api/analysis/evaluate")
      .send({
        groundTruthKeywords: ["typescript", "docker"],
        matchedKeywords: ["typescript"],
        missingKeywords: ["docker"],
      })
      .expect(201);
    expect(evaluated.body.data).toBeDefined();

    await request(app.getHttpServer()).get("/api/analysis/examples").expect(200);
  });
});
