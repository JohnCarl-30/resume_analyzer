import { Router } from "express";

import { resumeController } from "../controllers/resume.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const resumeRouter = Router();

resumeRouter.get("/", asyncHandler(resumeController.list));
resumeRouter.get("/:resumeId", asyncHandler(resumeController.getById));
resumeRouter.post("/", asyncHandler(resumeController.create));
