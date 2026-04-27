import { env } from "../config/env.js";
import { openAiClient } from "../lib/openai-client.js";
import { z } from "zod";

const jdExtractionSchema = {
  name: "jd_keyword_extraction",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      keywords: {
        type: "array",
        items: { type: "string" },
        description: "A comprehensive list of technical, domain, and soft skill keywords found in the JD.",
      },
      requiredSkills: {
        type: "array",
        items: { type: "string" },
        description: "A subset of keywords that are explicitly stated as 'required', 'must-have', or 'essential'.",
      },
      targetRoleTitle: {
        type: "string",
        description: "The official job title extracted from the description.",
      },
    },
    required: ["keywords", "requiredSkills", "targetRoleTitle"],
  },
} as const;

export interface JdExtractionResult {
  keywords: string[];
  requiredSkills: string[];
  targetRoleTitle: string;
}

const jdExtractionResultSchema = z.object({
  keywords: z.array(z.string()),
  requiredSkills: z.array(z.string()),
  targetRoleTitle: z.string(),
});

function parseJdExtractionContent(content: string): JdExtractionResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown JSON parse error";
    throw new Error(`Invalid JSON payload from OpenAI (${message}).`);
  }

  const result = jdExtractionResultSchema.safeParse(parsed);

  if (!result.success) {
    throw new Error(`Schema validation failed: ${result.error.issues[0]?.message ?? "Unknown validation error"}`);
  }

  return result.data;
}

export const openAiJdExtractionService = {
  isEnabled() {
    return openAiClient.isEnabled();
  },

  async extractKeywordsFromJd(jobDescription: string, targetRole: string): Promise<JdExtractionResult> {
    if (!this.isEnabled()) {
      // Fallback to empty if OpenAI is disabled
      return {
        keywords: [],
        requiredSkills: [],
        targetRoleTitle: targetRole,
      };
    }

    try {
      const content = await openAiClient.createStructuredChatCompletion({
        model: env.OPENAI_EXTRACTION_MODEL,
        temperature: 0.1,
        response_format: {
          type: "json_schema",
          json_schema: jdExtractionSchema,
        },
        messages: [
          {
            role: "system",
            content:
              "You are an expert technical recruiter. Extract structured keywords and required skills from the job description. Focus on technologies, methodologies, and specific domain expertise. Distinguish between 'required' skills and 'nice-to-have' keywords.",
          },
          {
            role: "user",
            content: `Target Role Header: ${targetRole}\n\nJob Description:\n${jobDescription}`,
          },
        ],
      });

      return parseJdExtractionContent(content);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown error";
      console.warn(
        `[jd-extraction] OpenAI extraction failed, falling back to empty keywords. Reason: ${reason}`,
      );
      return {
        keywords: [],
        requiredSkills: [],
        targetRoleTitle: targetRole,
      };
    }
  },
};
