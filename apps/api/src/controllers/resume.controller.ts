import type { Context } from "hono";

import { resumeService } from "../services/resume.service.js";
import type { AppEnv } from "../types/hono.js";
import { readJsonBody } from "../utils/request-body.js";

export const resumeController = {
  async list(c: Context) {
    const resumes = await resumeService.listResumes();
    return c.json({ data: resumes });
  },

  async getById(c: Context<AppEnv, "/:resumeId">) {
    const resume = await resumeService.getResumeById(c.req.param("resumeId"));
    return c.json({ data: resume });
  },

  async create(c: Context) {
    const resume = await resumeService.createResume(await readJsonBody(c));
    return c.json({ data: resume }, 201);
  },
};
