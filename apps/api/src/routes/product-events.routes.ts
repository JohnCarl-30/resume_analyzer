import { Hono } from "hono";

import { productEventsController } from "../controllers/product-events.controller.js";
import { requireAuth } from "../middlewares/require-auth.js";
import type { AppEnv } from "../types/hono.js";

export const productEventsRouter = new Hono<AppEnv>();

productEventsRouter.post("/", requireAuth, productEventsController.create);
productEventsRouter.get("/summary", requireAuth, productEventsController.summary);
