import { Hono } from "hono";

import { resumeController } from "../controllers/resume.controller.js";
import type { AppEnv } from "../types/hono.js";

export const resumeRouter = new Hono<AppEnv>();

resumeRouter.get("/", resumeController.list);
resumeRouter.get("/:resumeId", resumeController.getById);
resumeRouter.post("/", resumeController.create);
