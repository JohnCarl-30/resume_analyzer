import type { Context } from "hono";

import { jobApplicationService } from "../services/job-application.service.js";
import type { AppEnv } from "../types/hono.js";
import { readJsonBody } from "../utils/request-body.js";

export const jobApplicationController = {
  async list(c: Context<AppEnv>) {
    const applications = await jobApplicationService.listApplications(
      c.get("userId"),
    );
    return c.json({ data: applications });
  },

  async getById(c: Context<AppEnv, "/:applicationId">) {
    const application = await jobApplicationService.getApplicationById(
      c.req.param("applicationId"),
      c.get("userId"),
    );
    return c.json({ data: application });
  },

  async create(c: Context<AppEnv>) {
    const application = await jobApplicationService.createApplication(
      c.get("userId"),
      await readJsonBody(c),
    );
    return c.json({ data: application }, 201);
  },

  async update(c: Context<AppEnv, "/:applicationId">) {
    const application = await jobApplicationService.updateApplication(
      c.req.param("applicationId"),
      c.get("userId"),
      await readJsonBody(c),
    );
    return c.json({ data: application });
  },

  async remove(c: Context<AppEnv, "/:applicationId">) {
    await jobApplicationService.deleteApplication(
      c.req.param("applicationId"),
      c.get("userId"),
    );
    return c.body(null, 204);
  },
};
