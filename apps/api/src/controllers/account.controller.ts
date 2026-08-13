import type { Context } from "hono";

import { accountService } from "../services/account.service.js";
import type { AppEnv } from "../types/hono.js";

export const accountController = {
  async getAnalysisQuota(c: Context<AppEnv>) {
    const quota = await accountService.getAnalysisQuota(c.get("userId"));
    return c.json({ data: quota });
  },
};
