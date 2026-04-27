import { Router } from "express";
import multer from "multer";

import { analysisController } from "../controllers/analysis.controller.js";
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

analysisRouter.post("/", asyncHandler(analysisController.create));
analysisRouter.get("/", asyncHandler(analysisController.list));
analysisRouter.get("/:analysisId/source", asyncHandler(analysisController.getSourceFile));
analysisRouter.get("/:analysisId", asyncHandler(analysisController.getById));
analysisRouter.patch("/:analysisId", asyncHandler(analysisController.update));
analysisRouter.post(
  "/upload",
  analysisUpload.single("resume"),
  asyncHandler(analysisController.createFromUpload),
);
analysisRouter.post(
  "/template",
  asyncHandler(analysisController.createFromTemplate),
);
