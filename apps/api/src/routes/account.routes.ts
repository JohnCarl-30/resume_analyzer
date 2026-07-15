import { Router } from "express";

import { accountController } from "../controllers/account.controller.js";
import { requireAuth } from "../middlewares/require-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const accountRouter = Router();

accountRouter.get(
  "/analysis-quota",
  requireAuth,
  asyncHandler(accountController.getAnalysisQuota),
);
