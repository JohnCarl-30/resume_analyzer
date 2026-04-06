import type { Request, Response } from "express";

import { analysisService } from "../services/analysis.service.js";

export const analysisController = {
  async create(req: Request, res: Response) {
    const analysis = await analysisService.createAnalysis(req.body);
    res.status(201).json({ data: analysis });
  },

  async getById(req: Request, res: Response) {
    const analysisId = Array.isArray(req.params.analysisId)
      ? req.params.analysisId[0]
      : req.params.analysisId;

    const analysis = await analysisService.getAnalysisById(analysisId);
    res.json({ data: analysis });
  },

  async update(req: Request, res: Response) {
    const analysisId = Array.isArray(req.params.analysisId)
      ? req.params.analysisId[0]
      : req.params.analysisId;

    const updated = await analysisService.updateAnalysis(analysisId, req.body);
    res.json({ data: updated });
  },

  async createFromUpload(req: Request, res: Response) {
    const analysis = await analysisService.createAnalysisFromUpload({
      targetRole: req.body.targetRole,
      jobDescription: req.body.jobDescription,
      selectedTemplateId: req.body.selectedTemplateId,
      resumeFile: req.file,
    });

    res.status(201).json({ data: analysis });
  },

  async getSourceFile(req: Request, res: Response) {
    const analysisId = Array.isArray(req.params.analysisId)
      ? req.params.analysisId[0]
      : req.params.analysisId;

    const sourceFile = await analysisService.getAnalysisSourceFile(analysisId);

    res.setHeader("Content-Type", sourceFile.contentType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(sourceFile.fileName)}"`,
    );
    res.send(Buffer.from(sourceFile.dataBase64, "base64"));
  },
};
