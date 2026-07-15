import { createRemoteJWKSet, jwtVerify } from "jose";

import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

const jwks = env.SUPABASE_URL
  ? createRemoteJWKSet(new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`))
  : null;

export const authConfig = {
  isEnabled: Boolean(env.SUPABASE_URL),
};

export async function verifySupabaseAccessToken(token: string): Promise<string> {
  if (!authConfig.isEnabled || !jwks) {
    throw new HttpError(503, "Sign-in is not configured on the server yet.");
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: `${env.SUPABASE_URL}/auth/v1`,
      audience: "authenticated",
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
