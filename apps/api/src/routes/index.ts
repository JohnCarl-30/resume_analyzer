import { Hono } from "hono";

import type { AppEnv } from "../types/hono.js";
import { accountRouter } from "./account.routes.js";
import { analysisRouter } from "./analysis.routes.js";
import { enhancementRouter } from "./enhancement.routes.js";
import { jobApplicationRouter } from "./job-application.routes.js";
import { productEventsRouter } from "./product-events.routes.js";

export const apiRouter = new Hono<AppEnv>();

apiRouter.route("/analysis", analysisRouter);
apiRouter.route("/account", accountRouter);
apiRouter.route("/enhance", enhancementRouter);
apiRouter.route("/events", productEventsRouter);
apiRouter.route("/applications", jobApplicationRouter);
