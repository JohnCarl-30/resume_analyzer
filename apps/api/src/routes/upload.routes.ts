import { Router } from "express";

import { uploadController } from "../controllers/upload.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const uploadRouter = Router();

uploadRouter.post("/sign", asyncHandler(uploadController.sign));
