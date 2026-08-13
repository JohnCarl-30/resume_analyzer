import * as Sentry from "@sentry/node";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError } from "zod";

import { HttpError } from "../utils/http-error.js";

/**
 * Hono's onError handler.
 *
 * Sentry used to be wired in by setupExpressErrorHandler; with Hono there is no
 * equivalent, so unexpected errors are reported here explicitly. Expected ones
 * (validation, HttpError) are answers, not incidents, and stay unreported.
 */
export function errorHandler(error: Error, c: Context) {
  if (error instanceof ZodError) {
    return c.json(
      {
        error: "Validation failed",
        details: error.flatten(),
      },
      400,
    );
  }

  if (error instanceof HttpError) {
    return c.json(
      {
        error: error.message,
      },
      error.statusCode as ContentfulStatusCode,
    );
  }

  console.error(error);
  Sentry.captureException(error);

  return c.json(
    {
      error: "Internal server error",
    },
    500,
  );
}
