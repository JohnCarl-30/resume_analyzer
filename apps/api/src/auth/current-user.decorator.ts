import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

import type { AuthenticatedRequest } from "./clerk-auth.guard.js";

/**
 * Injects the authenticated user's id into a handler parameter.
 *
 * Only valid on routes behind ClerkAuthGuard, which is what sets it.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().userId,
);
