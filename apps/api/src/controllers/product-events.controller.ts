import type { Context } from "hono";

import { productEventsService } from "../services/product-events.service.js";
import type { AppEnv } from "../types/hono.js";
import { readJsonBody } from "../utils/request-body.js";

export const productEventsController = {
  async create(c: Context<AppEnv>) {
    const event = await productEventsService.track(
      c.get("userId"),
      await readJsonBody(c),
    );
    return c.json({ data: event }, 201);
  },

  async summary(c: Context<AppEnv>) {
    const counts = await productEventsService.summarizeForUser(c.get("userId"));
    return c.json({ data: counts });
  },
};
