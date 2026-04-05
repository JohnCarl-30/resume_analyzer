import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

interface ChatCompletionRequest {
  model: string;
  messages: Array<{
    role: "system" | "user";
    content: string;
  }>;
  response_format?: Record<string, unknown>;
  temperature?: number;
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
      refusal?: string | null;
    };
  }>;
  error?: {
    message?: string;
  };
}

export const openAiClient = {
  provider: "openai" as const,

  isEnabled() {
    return Boolean(env.OPENAI_API_KEY);
  },

  async createStructuredChatCompletion(request: ChatCompletionRequest) {
    if (!env.OPENAI_API_KEY) {
      throw new HttpError(500, "OPENAI_API_KEY is not configured.");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(request),
    });

    const payload = (await response.json()) as ChatCompletionResponse;

    if (!response.ok) {
      throw new HttpError(
        response.status,
        payload.error?.message ?? "OpenAI extraction request failed.",
      );
    }

    const content = payload.choices?.[0]?.message?.content;
    const refusal = payload.choices?.[0]?.message?.refusal;

    if (refusal) {
      throw new HttpError(502, refusal);
    }

    if (!content) {
      throw new HttpError(502, "OpenAI returned an empty extraction response.");
    }

    return content;
  },
};
