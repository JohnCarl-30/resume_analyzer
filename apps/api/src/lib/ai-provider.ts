import { loadOpenAiSdk, type OpenAiSdk } from "../ai/ai-sdk.js";
import { env } from "../config/env.js";

type OpenAiClient = ReturnType<OpenAiSdk["createOpenAI"]>;

/**
 * The OpenAI client is built lazily because `@ai-sdk/openai` is ESM-only and
 * has to be loaded with a dynamic import. Construction is memoised so the key
 * is read and the client created once.
 */
let client: Promise<OpenAiClient> | null = null;

function getClient(): Promise<OpenAiClient> {
  const apiKey = env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  client ??= loadOpenAiSdk().then(({ createOpenAI }) => createOpenAI({ apiKey }));
  return client;
}

export const aiProvider = {
  get provider(): "openai" | "none" {
    return env.OPENAI_API_KEY ? "openai" : "none";
  },

  isEnabled(): boolean {
    return Boolean(env.OPENAI_API_KEY);
  },

  async getModel(modelId?: string) {
    const openai = await getClient();
    return openai(modelId ?? env.AI_EXTRACTION_MODEL);
  },

  getExtractionProviderLabel(): "openai" | "parser" {
    return env.OPENAI_API_KEY ? "openai" : "parser";
  },
};
