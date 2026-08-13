import { createMiddleware } from "hono/factory";

export const privateApiCacheHeaders = createMiddleware(async (c, next) => {
  c.header("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  c.header("Vercel-CDN-Cache-Control", "no-store");
  c.header("Pragma", "no-cache");
  c.header("Expires", "0");
  await next();
});
