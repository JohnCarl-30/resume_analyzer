import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types";

import { AppModule } from "../src/app.module.js";
import { ClerkAuthGuard } from "../src/auth/clerk-auth.guard.js";
import { HttpErrorFilter } from "../src/common/http-error.filter.js";

const USER_ID = "user_account_e2e";

describe("Account (e2e)", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
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

  it("reports the free check as available", async () => {
    const response = await request(app.getHttpServer())
      .get("/api/account/analysis-quota")
      .expect(200);

    expect(response.body.data).toEqual({
      limit: 1,
      used: 0,
      canAnalyze: true,
      analysisId: null,
      redeemedAt: null,
    });
  });
});
