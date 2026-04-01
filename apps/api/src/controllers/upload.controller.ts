import type { Request, Response } from "express";

import { uploadService } from "../services/upload.service.js";

export const uploadController = {
  async sign(req: Request, res: Response) {
    const upload = await uploadService.createUploadTarget(req.body);
    res.status(201).json({ data: upload });
  },
};
