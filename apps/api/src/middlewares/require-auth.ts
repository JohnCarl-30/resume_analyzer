import { createMiddleware } from "hono/factory";

import { verifyClerkAccessToken } from "../lib/clerk-auth.js";
import type { AppEnv } from "../types/hono.js";
import { HttpError } from "../utils/http-error.js";

export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const authorization = c.req.header("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new HttpError(401, "Sign in to check your resume.");
  }

  const token = authorization.slice("Bearer ".length).trim();

  if (!token) {
    throw new HttpError(401, "Sign in to check your resume.");
  }

  c.set("userId", await verifyClerkAccessToken(token));
  await next();
});
