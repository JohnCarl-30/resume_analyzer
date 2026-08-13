/**
 * Loaders for the Vercel AI SDK.
 *
 * `ai` and `@ai-sdk/openai` are ESM-only packages, and this API compiles to
 * CommonJS so that NestJS and ts-jest work on their well-trodden paths. A
 * static import would emit `require()` and fail at runtime, so the SDK is
 * pulled in with dynamic `import()`, which TypeScript preserves verbatim
 * under `module: node16` rather than downlevelling it.
 *
 * Each loader memoises its promise, so the SDK is evaluated once per process
 * however many callers ask for it.
 */
export type AiSdk = typeof import("ai", { with: { "resolution-mode": "import" } });
export type OpenAiSdk = typeof import("@ai-sdk/openai", { with: { "resolution-mode": "import" } });

let aiSdk: Promise<AiSdk> | null = null;
let openAiSdk: Promise<OpenAiSdk> | null = null;

export function loadAiSdk(): Promise<AiSdk> {
  aiSdk ??= import("ai");
  return aiSdk;
}

export function loadOpenAiSdk(): Promise<OpenAiSdk> {
  openAiSdk ??= import("@ai-sdk/openai");
  return openAiSdk;
}
