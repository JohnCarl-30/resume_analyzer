import { Router } from "express";
import { bulletEnhancementService } from "../services/bullet-enhancement.service.js";
import { resumeTailoringService } from "../services/resume-tailoring.service.js";
import { tailorResumeSchema } from "../schemas/tailor-resume.schema.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";

export const enhancementRouter = Router();

enhancementRouter.post("/bullets", asyncHandler(async (req, res) => {
  const { role, bullets } = req.body;

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

  res.json({ data: enhanced });
}));

enhancementRouter.post("/tailor-resume", asyncHandler(async (req, res) => {
  const payload = tailorResumeSchema.parse(req.body);
  const draft = await resumeTailoringService.tailorResume(payload);
  res.json({ data: draft });
}));
