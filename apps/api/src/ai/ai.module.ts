import { Module } from "@nestjs/common";

import { loadAiSdk, type AiSdk } from "./ai-sdk.js";

/** Injection token carrying the Vercel AI SDK namespace. */
export const AI_SDK = Symbol("AI_SDK");

/**
 * Supplies the AI SDK through dependency injection.
 *
 * Services that take the SDK as a dependency can be given a stub in tests. A
 * static `import { generateObject } from "ai"` cannot be replaced without
 * module-level mocking, which is why the AI services were previously
 * untestable in isolation.
 *
 * The factory is async because the SDK is ESM-only and must be loaded with a
 * dynamic import; Nest awaits async factories before the module is ready.
 */
@Module({
  providers: [
    {
      provide: AI_SDK,
      useFactory: (): Promise<AiSdk> => loadAiSdk(),
    },
  ],
  exports: [AI_SDK],
})
export class AiModule {}
