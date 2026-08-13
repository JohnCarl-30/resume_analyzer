import { Hono } from "hono";

import { jobApplicationController } from "../controllers/job-application.controller.js";
import { requireAuth } from "../middlewares/require-auth.js";
import type { AppEnv } from "../types/hono.js";

export const jobApplicationRouter = new Hono<AppEnv>();

jobApplicationRouter.get("/", requireAuth, jobApplicationController.list);
jobApplicationRouter.post("/", requireAuth, jobApplicationController.create);
jobApplicationRouter.get("/:applicationId", requireAuth, jobApplicationController.getById);
jobApplicationRouter.patch("/:applicationId", requireAuth, jobApplicationController.update);
jobApplicationRouter.delete("/:applicationId", requireAuth, jobApplicationController.remove);
