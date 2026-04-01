import type { Request, Response } from "express";

import { resumeService } from "../services/resume.service.js";

export const resumeController = {
  async list(_req: Request, res: Response) {
    const resumes = await resumeService.listResumes();
    res.json({ data: resumes });
  },

  async getById(req: Request, res: Response) {
    const resumeId = Array.isArray(req.params.resumeId)
      ? req.params.resumeId[0]
      : req.params.resumeId;
    const resume = await resumeService.getResumeById(resumeId);
    res.json({ data: resume });
  },

  async create(req: Request, res: Response) {
    const resume = await resumeService.createResume(req.body);
    res.status(201).json({ data: resume });
  },
};
