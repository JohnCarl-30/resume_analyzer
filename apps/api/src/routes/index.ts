import { Router } from "express";

import { uploadRouter } from "./upload.routes.js";
import { resumeRouter } from "./resume.routes.js";

export const apiRouter = Router();

apiRouter.use("/uploads", uploadRouter);
apiRouter.use("/resumes", resumeRouter);
