import type { Context } from "hono";

/**
 * Read a JSON request body without throwing on a missing or malformed one.
 *
 * Express's json() middleware left `req.body` as `{}` when there was nothing to
 * parse, and the schemas downstream depend on that: they turn an empty object
 * into a 400 "Validation failed" rather than a 500. Hono's `c.req.json()`
 * throws instead, so this restores the old shape.
 */
export async function readJsonBody(c: Context): Promise<Record<string, unknown>> {
  try {
    const parsed: unknown = await c.req.json();
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}
