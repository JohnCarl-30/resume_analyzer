import type { Request, Response } from "express";

import { analysisService } from "../services/analysis.service.js";

export const analysisController = {
  async create(req: Request, res: Response) {
    const analysis = await analysisService.createAnalysis(req.body);
    res.status(201).json({ data: analysis });
  },
};
