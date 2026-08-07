import { Router } from "express";

import { jobApplicationController } from "../controllers/job-application.controller.js";
import { requireAuth } from "../middlewares/require-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const jobApplicationRouter = Router();

jobApplicationRouter.get(
  "/",
  requireAuth,
  asyncHandler(jobApplicationController.list),
);
jobApplicationRouter.post(
  "/",
  requireAuth,
  asyncHandler(jobApplicationController.create),
);
jobApplicationRouter.get(
  "/:applicationId",
  requireAuth,
  asyncHandler(jobApplicationController.getById),
);
jobApplicationRouter.patch(
  "/:applicationId",
  requireAuth,
  asyncHandler(jobApplicationController.update),
);
jobApplicationRouter.delete(
  "/:applicationId",
  requireAuth,
  asyncHandler(jobApplicationController.remove),
);
