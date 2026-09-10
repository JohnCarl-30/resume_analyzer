import {
  BadRequestException,
  Body,
  Controller,
  Post,
  ServiceUnavailableException,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";

import { EnhanceThrottlerGuard } from "../common/enhance-throttler.guard.js";

import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import {
  tailorResumeSchema,
  type TailorResumeInput,
} from "../schemas/tailor-resume.schema.js";
import { BulletEnhancementService } from "./bullet-enhancement.service.js";
import { ResumeTailoringService } from "./resume-tailoring.service.js";

/**
 * Deliberately unauthenticated: the scratch builder is public by design
 * ("free, no sign-in") and calls /bullets from the editor, so requiring a
 * session would break it.
 *
 * Unauthenticated does not mean uncapped. Both routes spend OpenAI tokens, so
 * they are rate limited per caller: 10 requests a minute is far above what the
 * editor does in normal use and far below what makes the endpoint worth
 * abusing.
 */
@Controller("api/enhance")
@UseGuards(EnhanceThrottlerGuard)
@Throttle({ default: { ttl: 60_000, limit: 10 } })
export class EnhancementController {
  constructor(
    private readonly bulletEnhancement: BulletEnhancementService,
    private readonly resumeTailoring: ResumeTailoringService,
  ) {}

  @Post("bullets")
  async enhanceBullets(@Body() body: Record<string, unknown>) {
    const { role, bullets } = body;

    if (!role || typeof role !== "string") {
      throw new BadRequestException("Role is required.");
    }

    if (!this.bulletEnhancement.isEnabled()) {
      throw new ServiceUnavailableException("AI enhancement is not available.");
    }

    const enhanced = await this.bulletEnhancement.enhanceBullets({
      role,
      existingBullets: Array.isArray(bullets) ? (bullets as string[]) : [],
    });

    return { data: enhanced };
  }

  @Post("tailor-resume")
  async tailorResume(
    @Body(new ZodValidationPipe(tailorResumeSchema)) body: TailorResumeInput,
  ) {
    // No enabled-check: tailoring degrades to a rule-based draft without AI.
    return { data: await this.resumeTailoring.tailorResume(body) };
  }
}
