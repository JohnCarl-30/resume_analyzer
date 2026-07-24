import type { Request, Response } from "express";

import { productEventsService } from "../services/product-events.service.js";

export const productEventsController = {
  async create(req: Request, res: Response) {
    const event = await productEventsService.track(req.userId!, req.body);
    res.status(201).json({ data: event });
  },

  async summary(req: Request, res: Response) {
    const counts = await productEventsService.summarizeForUser(req.userId!);
    res.json({ data: counts });
  },
};
