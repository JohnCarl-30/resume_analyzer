import { Hono } from "hono";

import { accountController } from "../controllers/account.controller.js";
import { requireAuth } from "../middlewares/require-auth.js";
import type { AppEnv } from "../types/hono.js";

export const accountRouter = new Hono<AppEnv>();

accountRouter.get("/analysis-quota", requireAuth, accountController.getAnalysisQuota);
