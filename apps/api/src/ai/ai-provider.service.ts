import { Injectable } from "@nestjs/common";

import { aiProvider } from "../lib/ai-provider.js";

type Model = Awaited<ReturnType<typeof aiProvider.getModel>>;

/**
 * The AI gate as an injectable, so services depending on "is AI configured,
 * and which model" can be handed a stub in tests. The underlying singleton
 * stays in lib/ai-provider.ts because unported Hono-era code still imports it
 * directly.
 */
@Injectable()
export class AiProviderService {
  isEnabled(): boolean {
    return aiProvider.isEnabled();
  }

  async getModel(modelId?: string): Promise<Model> {
    return aiProvider.getModel(modelId);
  }
}
