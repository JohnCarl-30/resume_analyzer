import type { RequestHandler } from "express";

export const privateApiCacheHeaders: RequestHandler = (_req, res, next) => {
  res.setHeader("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
};
