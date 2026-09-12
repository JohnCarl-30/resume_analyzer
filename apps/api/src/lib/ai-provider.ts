import { loadAiSdk, loadAzureSdk, loadOpenAiSdk, type OpenAiSdk } from "../ai/ai-sdk.js";
import { env } from "../config/env.js";

type OpenAiClient = ReturnType<OpenAiSdk["createOpenAI"]>;
type Model = ReturnType<OpenAiClient>;

/**
 * Azure takes precedence when it is configured: the deployments sit on the
 * same subscription as the API, so there is no second vendor to bill and no
 * second key to lose. OpenAI stays as the fallback, and with neither set the
 * analyzers run their rule-based paths.
 */
function useAzure(): boolean {
  return Boolean(env.AZURE_OPENAI_API_KEY && env.AZURE_OPENAI_RESOURCE_NAME);
}

/**
 * Reasoning models spend their completion budget thinking before they write,
 * and gpt-5-mini at its default effort will burn the whole budget and return
 * an empty string -- which looks exactly like a model failure and silently
 * drops every caller onto the rule-based fallback.
 *
 * Nothing here needs deliberation: the prompts rewrite a bullet or pull
 * keywords out of a job post against a fixed schema. "minimal" returns the
 * same quality of answer for a fraction of the tokens and latency.
 */
function isReasoningModel(modelId: string): boolean {
  return /^(gpt-5|o\d)/.test(modelId);
}

// Construction is memoised so the key is read and the client built once.
let client: Promise<OpenAiClient> | null = null;

function getClient(): Promise<OpenAiClient> {
  if (useAzure()) {
    client ??= loadAzureSdk().then(({ createAzure }) =>
      createAzure({
        apiKey: env.AZURE_OPENAI_API_KEY,
        resourceName: env.AZURE_OPENAI_RESOURCE_NAME,
        apiVersion: env.AZURE_OPENAI_API_VERSION,
      }),
    ) as Promise<OpenAiClient>;
    return client;
  }

  const apiKey = env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("No AI provider is configured");
  }

  client ??= loadOpenAiSdk().then(({ createOpenAI }) => createOpenAI({ apiKey }));
  return client;
}

/**
 * Resolves the model id. On Azure this is a *deployment* name rather than a
 * model name -- they often match, but the deployment is what the API accepts.
 */
function resolveModelId(modelId?: string): string {
  if (modelId) {
    return modelId;
  }

  return useAzure()
    ? (env.AZURE_OPENAI_DEPLOYMENT ?? env.AI_EXTRACTION_MODEL)
    : env.AI_EXTRACTION_MODEL;
}

export const aiProvider = {
  get provider(): "azure" | "openai" | "none" {
    if (useAzure()) return "azure";
    return env.OPENAI_API_KEY ? "openai" : "none";
  },

  isEnabled(): boolean {
    return useAzure() || Boolean(env.OPENAI_API_KEY);
  },

  async getModel(modelId?: string): Promise<Model> {
    const resolved = resolveModelId(modelId);
    const provider = await getClient();
    const model = provider(resolved);

    if (!isReasoningModel(resolved)) {
      return model;
    }

    // Applied here rather than at the five call sites: a per-call option is
    // one refactor away from being forgotten on one of them, and forgetting
    // it degrades that path to the fallback without any error to notice.
    const { wrapLanguageModel, defaultSettingsMiddleware } = await loadAiSdk();

    return wrapLanguageModel({
      model,
      middleware: defaultSettingsMiddleware({
        settings: {
          providerOptions: {
            openai: { reasoningEffort: "minimal" },
            azure: { reasoningEffort: "minimal" },
          },
        },
      }),
    }) as Model;
  },

  /**
   * Deliberately does not distinguish Azure from OpenAI. This label is
   * persisted on every analysis and returned over the API to say whether AI
   * or the rule-based parser produced the extraction -- Azure OpenAI serves
   * the same models, so it is "openai" for this purpose. Splitting it would
   * mean a column type change, an API contract change and a web change to
   * record a difference the field does not exist to make. Use `provider` for
   * the vendor.
   */
  getExtractionProviderLabel(): "openai" | "parser" {
    return this.isEnabled() ? "openai" : "parser";
  },
};
