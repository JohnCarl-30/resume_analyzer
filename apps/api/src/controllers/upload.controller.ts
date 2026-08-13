import type { Context } from "hono";

import { uploadService } from "../services/upload.service.js";
import { readJsonBody } from "../utils/request-body.js";

export const uploadController = {
  async sign(c: Context) {
    const upload = await uploadService.createUploadTarget(await readJsonBody(c));
    return c.json({ data: upload }, 201);
  },
};
