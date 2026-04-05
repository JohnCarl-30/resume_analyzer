import { Router } from "express";

import { analysisRouter } from "./analysis.routes.js";
import { uploadRouter } from "./upload.routes.js";
import { resumeRouter } from "./resume.routes.js";

export const apiRouter = Router();

apiRouter.use("/analysis", analysisRouter);
apiRouter.use("/uploads", uploadRouter);
apiRouter.use("/resumes", resumeRouter);
