import { Hono } from "hono";

import { tailorResumeSchema } from "../schemas/tailor-resume.schema.js";
import { bulletEnhancementService } from "../services/bullet-enhancement.service.js";
import { resumeTailoringService } from "../services/resume-tailoring.service.js";
import type { AppEnv } from "../types/hono.js";
import { HttpError } from "../utils/http-error.js";
import { readJsonBody } from "../utils/request-body.js";

export const enhancementRouter = new Hono<AppEnv>();

enhancementRouter.post("/bullets", async (c) => {
  const { role, bullets } = await readJsonBody(c);

  if (!role || typeof role !== "string") {
    throw new HttpError(400, "Role is required.");
  }

  if (!bulletEnhancementService.isEnabled()) {
    throw new HttpError(503, "AI enhancement is not available.");
  }

  const enhanced = await bulletEnhancementService.enhanceBullets({
    role,
    existingBullets: Array.isArray(bullets) ? bullets : [],
  });

  return c.json({ data: enhanced });
});

enhancementRouter.post("/tailor-resume", async (c) => {
  const payload = tailorResumeSchema.parse(await readJsonBody(c));
  const draft = await resumeTailoringService.tailorResume(payload);
  return c.json({ data: draft });
});
