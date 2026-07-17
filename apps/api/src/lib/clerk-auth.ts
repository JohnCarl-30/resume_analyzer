import { verifyToken } from "@clerk/backend";

import { resolveAppOrigins } from "../config/app-origins.js";
import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

export const authConfig = {
  isEnabled: Boolean(env.CLERK_SECRET_KEY),
};

export async function verifyClerkAccessToken(token: string): Promise<string> {
  if (!authConfig.isEnabled || !env.CLERK_SECRET_KEY) {
    throw new HttpError(503, "Sign-in is not configured on the server yet.");
  }

  try {
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
      authorizedParties: resolveAppOrigins(),
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
