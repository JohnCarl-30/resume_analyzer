import { createOpenAI } from "@ai-sdk/openai";
import { env } from "../config/env.js";

const openai = env.OPENAI_API_KEY ? createOpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

export const aiProvider = {
  provider: openai ? ("openai" as const) : ("none" as const),

  isEnabled() {
    return openai !== null;
  },

  getModel(modelId?: string) {
    if (!openai) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    return openai(modelId ?? env.AI_EXTRACTION_MODEL);
  },

  getExtractionProviderLabel(): "openai" | "parser" {
    return openai ? "openai" : "parser";
  },
};
