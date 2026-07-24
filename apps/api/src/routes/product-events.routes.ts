import { Router } from "express";

import { productEventsController } from "../controllers/product-events.controller.js";
import { requireAuth } from "../middlewares/require-auth.js";
import { asyncHandler } from "../utils/async-handler.js";

export const productEventsRouter = Router();

productEventsRouter.post("/", requireAuth, asyncHandler(productEventsController.create));
productEventsRouter.get("/summary", requireAuth, asyncHandler(productEventsController.summary));
