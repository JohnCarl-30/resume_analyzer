import { Router } from "express";
import multer from "multer";

import { analysisController } from "../controllers/analysis.controller.js";
import { requireAuth } from "../middlewares/require-auth.js";
import { HttpError } from "../utils/http-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { resumeParserService } from "../services/resume-parser.service.js";

export const analysisRouter = Router();

const analysisUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter(_req, file, callback) {
    if (!resumeParserService.isSupportedMimeType(file.mimetype)) {
      callback(
        new HttpError(
          400,
          "Please upload a PDF or DOCX resume so we can parse it.",
        ),
      );
      return;
    }

    callback(null, true);
  },
});

analysisRouter.post("/", requireAuth, asyncHandler(analysisController.create));
analysisRouter.get("/", requireAuth, asyncHandler(analysisController.list));

// Static routes must be registered before /:analysisId wildcard routes.
analysisRouter.get(
  "/examples",
  asyncHandler(analysisController.getFewShotExamples),
);
analysisRouter.post(
  "/examples",
  asyncHandler(analysisController.createFewShotExample),
);
analysisRouter.post(
  "/upload",
  requireAuth,
  analysisUpload.single("resume"),
  asyncHandler(analysisController.createFromUpload),
);
analysisRouter.post(
  "/template",
  requireAuth,
  asyncHandler(analysisController.createFromTemplate),
);
analysisRouter.post(
  "/pipeline",
  requireAuth,
  analysisUpload.single("resume"),
  asyncHandler(analysisController.runPipeline),
);
analysisRouter.post(
  "/search",
  requireAuth,
  asyncHandler(analysisController.semanticSearch),
);
analysisRouter.post(
  "/evaluate",
  asyncHandler(analysisController.evaluate),
);

analysisRouter.get("/:analysisId/source", requireAuth, asyncHandler(analysisController.getSourceFile));
analysisRouter.get("/:analysisId", requireAuth, asyncHandler(analysisController.getById));
analysisRouter.patch("/:analysisId", requireAuth, asyncHandler(analysisController.update));
