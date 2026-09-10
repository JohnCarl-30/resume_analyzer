import { Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import type { Request } from "express";

/**
 * Rate limits by caller rather than by connection.
 *
 * Two reasons the default tracker is wrong here:
 *
 * 1. The app runs behind Azure Container Apps ingress, so `req.ip` is the
 *    proxy's address for every request. Limiting on it would throttle all
 *    callers as if they were one.
 * 2. These routes are deliberately unauthenticated -- the public scratch
 *    builder calls /bullets -- so a signed-in user and an anonymous one share
 *    the surface. Signed-in callers are keyed by user id so one person's
 *    burst cannot exhaust everyone else's allowance behind a shared NAT.
 */
@Injectable()
export class EnhanceThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const userId = (req as Request & { userId?: string }).userId;

    if (userId) {
      return `user:${userId}`;
    }

    // X-Forwarded-For is a comma-separated chain; the left-most entry is the
    // original client. Azure appends to it, so the first hop is what we want.
    const forwarded = req.headers["x-forwarded-for"];
    const chain = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    const clientIp = chain?.split(",")[0]?.trim();

    return `ip:${clientIp || req.ip || "unknown"}`;
  }
}
