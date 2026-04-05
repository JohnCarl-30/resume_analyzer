import { Router } from "express";

import { analysisController } from "../controllers/analysis.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const analysisRouter = Router();

analysisRouter.post("/", asyncHandler(analysisController.create));
