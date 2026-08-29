import {
  BadRequestException,
  Body,
  Controller,
  Post,
  ServiceUnavailableException,
} from "@nestjs/common";

import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import {
  tailorResumeSchema,
  type TailorResumeInput,
} from "../schemas/tailor-resume.schema.js";
import { BulletEnhancementService } from "./bullet-enhancement.service.js";
import { ResumeTailoringService } from "./resume-tailoring.service.js";

/**
 * Deliberately unguarded: the scratch builder is public by design ("free, no
 * sign-in") and calls /bullets from the editor, so requiring a session here
 * would break it. That also means these routes spend OpenAI tokens for
 * anonymous callers -- a standing abuse surface, flagged rather than changed
 * by the port.
 */
@Controller("api/enhance")
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
