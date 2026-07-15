import type { NextFunction, Request, Response } from "express";

import { verifySupabaseAccessToken } from "../lib/supabase-auth.js";
import { HttpError } from "../utils/http-error.js";

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new HttpError(401, "Sign in to check your resume.");
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
      throw new HttpError(401, "Sign in to check your resume.");
    }

    req.userId = await verifySupabaseAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
}
