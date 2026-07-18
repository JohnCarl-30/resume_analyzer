import { verifyToken } from "@clerk/backend";

import { resolveAppOrigins } from "../config/app-origins.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

export const authConfig = {
  isEnabled: Boolean(env.CLERK_SECRET_KEY),
};

/**
 * Peek at `azp` without verifying the signature.
 * Clerk session tokens minted during top-level navigations often omit `azp`.
 * When `authorizedParties` is set, @clerk/backend rejects those tokens — so only
 * enforce the allowlist when the claim is present.
 */
function peekAuthorizedParty(token: string): string | undefined {
  const segments = token.split(".");
  if (segments.length < 2 || !segments[1]) {
    return undefined;
  }

  try {
    const payload = JSON.parse(Buffer.from(segments[1], "base64url").toString("utf8")) as {
      azp?: unknown;
    };
    return typeof payload.azp === "string" && payload.azp.length > 0 ? payload.azp : undefined;
  } catch {
    return undefined;
  }
}

export async function verifyClerkAccessToken(token: string): Promise<string> {
  if (!authConfig.isEnabled || !env.CLERK_SECRET_KEY) {
    throw new HttpError(503, "Sign-in is not configured on the server yet.");
  }

  try {
    const authorizedParty = peekAuthorizedParty(token);
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
      ...(authorizedParty ? { authorizedParties: resolveAppOrigins() } : {}),
    });

    if (typeof payload.sub !== "string" || payload.sub.length === 0) {
      throw new HttpError(401, "Sign in to check your resume.");
    }

    return payload.sub;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(401, "Your sign-in session expired. Sign in again.");
  }
}
