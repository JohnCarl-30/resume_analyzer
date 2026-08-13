import { type CanActivate, type ExecutionContext, Injectable } from "@nestjs/common";
import type { Request } from "express";

import { verifyClerkAccessToken } from "../lib/clerk-auth.js";
import { HttpError } from "../utils/http-error.js";

/** A request that has passed ClerkAuthGuard carries the caller's identity. */
export interface AuthenticatedRequest extends Request {
  userId: string;
}

/**
 * Rejects requests without a valid Clerk session token.
 *
 * Reuses verifyClerkAccessToken unchanged, so the wording and status codes are
 * identical to the previous middleware: 401 for a missing or invalid token,
 * 503 when the server has no Clerk key configured.
 */
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new HttpError(401, "Sign in to check your resume.");
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
      throw new HttpError(401, "Sign in to check your resume.");
    }

    request.userId = await verifyClerkAccessToken(token);
    return true;
  }
}
