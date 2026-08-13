import { BadRequestException, type PipeTransform } from "@nestjs/common";
import type { ZodType } from "zod";

/**
 * Validates a request body against a Zod schema.
 *
 * The failure body is Zod's flatten() output under `details`, which is exactly
 * what the Express API returned and what the web app's api-client reads to
 * populate per-field form errors. Nest's built-in validation shape would break
 * that, which is why this pipe exists rather than nestjs-zod's default.
 */
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      throw new BadRequestException({
        error: "Validation failed",
        details: result.error.flatten(),
      });
    }

    return result.data;
  }
}
