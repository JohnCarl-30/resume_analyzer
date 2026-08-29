import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";

import { HttpError } from "../utils/http-error.js";

/**
 * Translates thrown errors into the response bodies the web app already
 * expects: `{ "error": "..." }`, matching what the Express error handler
 * produced. Nest's default shape is `{ statusCode, message, error }`, which
 * would silently change every failure response.
 */
@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    // Services throw HttpError directly; it carries its own status.
    if (exception instanceof HttpError) {
      response.status(exception.statusCode).json({ error: exception.message });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      // Validation failures already carry the legacy shape from
      // ZodValidationPipe, so they are passed through untouched. Nest's own
      // default body ALSO has an "error" field -- holding the status text,
      // not the message -- so it must not match this branch, or a
      // BadRequestException("Role is required.") comes out as
      // {"error":"Bad Request"}.
      if (
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        !("statusCode" in body)
      ) {
        response.status(status).json(body);
        return;
      }

      response.status(status).json({ error: exception.message });
      return;
    }

    this.logger.error("Unhandled exception", exception as Error);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: "Internal server error",
    });
  }
}
