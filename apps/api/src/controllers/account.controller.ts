import type { Request, Response } from "express";

import { accountService } from "../services/account.service.js";

export const accountController = {
  async getAnalysisQuota(req: Request, res: Response) {
    const quota = await accountService.getAnalysisQuota(req.userId!);
    res.json({ data: quota });
  },
};
