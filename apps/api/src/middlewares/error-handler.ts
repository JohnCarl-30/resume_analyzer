import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";

import { HttpError } from "../utils/http-error.js";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: error.flatten(),
    });
  }

  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  if (error instanceof MulterError) {
    return res.status(400).json({
      error:
        error.code === "LIMIT_FILE_SIZE"
          ? "Resume must be 10 MB or smaller."
          : error.message,
    });
  }

  console.error(error);

  return res.status(500).json({
    error: "Internal server error",
  });
}
