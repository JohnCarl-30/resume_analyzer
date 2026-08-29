import { Inject, Injectable } from "@nestjs/common";
import { z } from "zod";

import { AiProviderService } from "../ai/ai-provider.service.js";
import { AI_SDK } from "../ai/ai.module.js";
import type { AiSdk } from "../ai/ai-sdk.js";

const enhanceSchema = z.object({
  bullets: z.array(z.string()),
});

@Injectable()
export class BulletEnhancementService {
  constructor(
    @Inject(AI_SDK) private readonly sdk: AiSdk,
    private readonly provider: AiProviderService,
  ) {}

  isEnabled(): boolean {
    return this.provider.isEnabled();
  }

  async enhanceBullets({
    role,
    existingBullets,
  }: {
    role: string;
    existingBullets: string[];
  }): Promise<string[]> {
    const context =
      existingBullets.length > 0
        ? `Existing bullets:\n${existingBullets.map((b) => `- ${b}`).join("\n")}\n\nEnhance these and add more impactful achievements.`
        : `Generate 3-4 strong, metric-driven bullet points for this role.`;

    const { object } = await this.sdk.generateObject({
      model: await this.provider.getModel(),
      schema: enhanceSchema,
      temperature: 0.3,
      system:
        "You are an expert resume writer. Generate concise, impactful resume bullet points that use strong action verbs and include quantifiable metrics where possible. Each bullet should be 1-2 sentences maximum.",
      prompt: `Role: ${role}\n\n${context}`,
    });

    return object.bullets;
  }
}
