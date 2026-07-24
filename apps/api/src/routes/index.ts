import { Router } from "express";

import { analysisRouter } from "./analysis.routes.js";
import { accountRouter } from "./account.routes.js";
import { uploadRouter } from "./upload.routes.js";
import { resumeRouter } from "./resume.routes.js";
import { enhancementRouter } from "./enhancement.routes.js";
import { productEventsRouter } from "./product-events.routes.js";

export const apiRouter = Router();

apiRouter.use("/analysis", analysisRouter);
apiRouter.use("/account", accountRouter);
apiRouter.use("/uploads", uploadRouter);
apiRouter.use("/resumes", resumeRouter);
apiRouter.use("/enhance", enhancementRouter);
apiRouter.use("/events", productEventsRouter);
