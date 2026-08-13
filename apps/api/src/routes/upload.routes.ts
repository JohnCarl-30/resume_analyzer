import { Hono } from "hono";

import { uploadController } from "../controllers/upload.controller.js";
import type { AppEnv } from "../types/hono.js";

export const uploadRouter = new Hono<AppEnv>();

uploadRouter.post("/sign", uploadController.sign);
