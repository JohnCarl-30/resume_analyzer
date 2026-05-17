import { generateObject } from "ai";
import { z } from "zod";
import { env } from "../config/env.js";
import { aiProvider } from "../lib/ai-provider.js";

const enhanceSchema = z.object({
  bullets: z.array(z.string()),
});

export const bulletEnhancementService = {
  isEnabled() {
    return aiProvider.isEnabled();
  },

  async enhanceBullets({
    role,
    existingBullets,
  }: {
    role: string;
    existingBullets: string[];
  }): Promise<string[]> {
    if (!this.isEnabled()) {
      throw new Error("Vertex AI is not configured.");
    }

    const context = existingBullets.length > 0
      ? `Existing bullets:\n${existingBullets.map((b) => `- ${b}`).join("\n")}\n\nEnhance these and add more impactful achievements.`
      : `Generate 3-4 strong, metric-driven bullet points for this role.`;

    const { object } = await generateObject({
      model: aiProvider.getModel(),
      schema: enhanceSchema,
      temperature: 0.3,
      system:
        "You are an expert resume writer. Generate concise, impactful resume bullet points that use strong action verbs and include quantifiable metrics where possible. Each bullet should be 1-2 sentences maximum.",
      prompt: `Role: ${role}\n\n${context}`,
    });

    return object.bullets;
  },
};
