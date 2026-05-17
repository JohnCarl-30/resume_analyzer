import { Router } from "express";
import { bulletEnhancementService } from "../services/bullet-enhancement.service.js";
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
