import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";

import { ClerkAuthGuard } from "../auth/clerk-auth.guard.js";
import { CurrentUser } from "../auth/current-user.decorator.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import {
  createProductEventSchema,
  type CreateProductEventInput,
} from "../schemas/product-event.schema.js";
import { ProductEventsService } from "./product-events.service.js";

@Controller("api/events")
@UseGuards(ClerkAuthGuard)
export class ProductEventsController {
  constructor(private readonly productEvents: ProductEventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() userId: string,
    // Bound to the body rather than the whole method: a method-level pipe also
    // runs against @CurrentUser, and validating a user id string against an
    // object schema fails every request with a 400.
    @Body(new ZodValidationPipe(createProductEventSchema)) body: CreateProductEventInput,
  ) {
    return { data: await this.productEvents.track(userId, body) };
  }

  @Get("summary")
  async summary(@CurrentUser() userId: string) {
    return { data: await this.productEvents.summarizeForUser(userId) };
  }
}
