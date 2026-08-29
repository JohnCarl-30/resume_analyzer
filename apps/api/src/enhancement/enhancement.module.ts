import { Module } from "@nestjs/common";

import { AiModule } from "../ai/ai.module.js";
import { BulletEnhancementService } from "./bullet-enhancement.service.js";
import { EnhancementController } from "./enhancement.controller.js";
import { ResumeTailoringService } from "./resume-tailoring.service.js";

@Module({
  imports: [AiModule],
  controllers: [EnhancementController],
  providers: [BulletEnhancementService, ResumeTailoringService],
})
export class EnhancementModule {}
