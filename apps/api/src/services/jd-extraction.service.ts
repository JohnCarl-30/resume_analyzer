import { generateObject } from "ai";
import { z } from "zod";
import { env } from "../config/env.js";
import { aiProvider } from "../lib/ai-provider.js";

const jdExtractionResultSchema = z.object({
  keywords: z.array(z.string()),
  requiredSkills: z.array(z.string()),
  targetRoleTitle: z.string(),
});

export type JdExtractionResult = z.infer<typeof jdExtractionResultSchema>;

export const jdExtractionService = {
  isEnabled() {
    return aiProvider.isEnabled();
  },

  async extractKeywordsFromJd(
    jobDescription: string,
    targetRole: string,
  ): Promise<JdExtractionResult> {
    if (!this.isEnabled()) {
      return {
        keywords: [],
        requiredSkills: [],
        targetRoleTitle: targetRole,
      };
    }

    try {
      const { object } = await generateObject({
        model: aiProvider.getModel(),
        schema: jdExtractionResultSchema,
        temperature: 0.1,
        system:
          "You are an expert technical recruiter. Extract structured keywords and required skills from the job description. Focus on technologies, methodologies, and specific domain expertise. Distinguish between 'required' skills and 'nice-to-have' keywords.",
        prompt: `Target Role Header: ${targetRole}\n\nJob Description:\n${jobDescription}`,
      });

      return object;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      console.warn(
        `[jd-extraction] Vertex AI extraction failed, falling back to empty keywords. Reason: ${reason}`,
      );
      return {
        keywords: [],
        requiredSkills: [],
        targetRoleTitle: targetRole,
      };
    }
  },
};
