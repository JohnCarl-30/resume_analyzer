import { env } from "./env.js";

const PRODUCTION_ORIGINS = [
  "https://resumae.tech",
  "https://www.resumae.tech",
  "https://resume-analyzer-chi-gray.vercel.app",
];

/**
 * Resolves allowed web origins for CORS and Clerk JWT `azp` verification.
 * In local dev, Next.js may fall back to :3001 when :3000 is taken.
 */
export function resolveAppOrigins(origin = env.APP_ORIGIN): string[] {
  const configured = origin
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  const resolved = new Set(configured.length > 0 ? configured : ["http://localhost:3000"]);

  for (const productionOrigin of PRODUCTION_ORIGINS) {
    resolved.add(productionOrigin);
  }

  const primary = configured[0] ?? "http://localhost:3000";
  if (primary.startsWith("http://localhost") || primary.startsWith("http://127.0.0.1")) {
    for (const host of ["localhost", "127.0.0.1"]) {
      resolved.add(`http://${host}:3000`);
      resolved.add(`http://${host}:3001`);
    }
  }

  return [...resolved];
}
