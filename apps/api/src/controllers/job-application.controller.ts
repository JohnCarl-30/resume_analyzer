import type { Request, Response } from "express";

import { jobApplicationService } from "../services/job-application.service.js";

function getUserId(req: Request) {
  return req.userId!;
}

function getApplicationId(req: Request) {
  return Array.isArray(req.params.applicationId)
    ? req.params.applicationId[0]
    : req.params.applicationId;
}

export const jobApplicationController = {
  async list(req: Request, res: Response) {
    const applications = await jobApplicationService.listApplications(
      getUserId(req),
    );
    res.json({ data: applications });
  },

  async getById(req: Request, res: Response) {
    const application = await jobApplicationService.getApplicationById(
      getApplicationId(req),
      getUserId(req),
    );
    res.json({ data: application });
  },

  async create(req: Request, res: Response) {
    const application = await jobApplicationService.createApplication(
      getUserId(req),
      req.body,
    );
    res.status(201).json({ data: application });
  },

  async update(req: Request, res: Response) {
    const application = await jobApplicationService.updateApplication(
      getApplicationId(req),
      getUserId(req),
      req.body,
    );
    res.json({ data: application });
  },

  async remove(req: Request, res: Response) {
    await jobApplicationService.deleteApplication(
      getApplicationId(req),
      getUserId(req),
    );
    res.status(204).send();
  },
};
