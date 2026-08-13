import { Hono } from "hono";

import { analysisController } from "../controllers/analysis.controller.js";
import { requireAuth } from "../middlewares/require-auth.js";
import type { AppEnv } from "../types/hono.js";

export const analysisRouter = new Hono<AppEnv>();

analysisRouter.post("/", requireAuth, analysisController.create);
analysisRouter.get("/", requireAuth, analysisController.list);

// Static routes must be registered before /:analysisId wildcard routes.
analysisRouter.get("/examples", analysisController.getFewShotExamples);
analysisRouter.post("/examples", analysisController.createFewShotExample);
analysisRouter.post("/upload", requireAuth, analysisController.createFromUpload);
analysisRouter.post("/template", requireAuth, analysisController.createFromTemplate);
analysisRouter.post("/search", requireAuth, analysisController.semanticSearch);
analysisRouter.post("/evaluate", analysisController.evaluate);

analysisRouter.get("/:analysisId/source", requireAuth, analysisController.getSourceFile);
analysisRouter.get("/:analysisId", requireAuth, analysisController.getById);
analysisRouter.patch("/:analysisId", requireAuth, analysisController.update);
