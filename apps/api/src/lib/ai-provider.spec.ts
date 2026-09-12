const mockEnv: Record<string, string | undefined> = {};

jest.mock("../config/env.js", () => ({ env: mockEnv }));

function loadProvider(): typeof import("./ai-provider.js") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./ai-provider.js") as typeof import("./ai-provider.js");
}

describe("aiProvider", () => {
  beforeEach(() => {
    jest.resetModules();
    for (const key of Object.keys(mockEnv)) delete mockEnv[key];
    mockEnv.AI_EXTRACTION_MODEL = "gpt-4o-mini";
    mockEnv.AZURE_OPENAI_API_VERSION = "2024-12-01-preview";
  });

  it("reports no provider when nothing is configured", () => {
    const { aiProvider } = loadProvider();

    expect(aiProvider.isEnabled()).toBe(false);
    expect(aiProvider.provider).toBe("none");
    expect(aiProvider.getExtractionProviderLabel()).toBe("parser");
  });

  it("uses OpenAI when only that key is present", () => {
    mockEnv.OPENAI_API_KEY = "sk-test";
    const { aiProvider } = loadProvider();

    expect(aiProvider.provider).toBe("openai");
    expect(aiProvider.isEnabled()).toBe(true);
  });

  // Azure wins because its deployments bill to the same subscription as the
  // API, so there is no second vendor to keep a key for.
  it("prefers Azure when both are configured", () => {
    mockEnv.OPENAI_API_KEY = "sk-test";
    mockEnv.AZURE_OPENAI_API_KEY = "azure-key";
    mockEnv.AZURE_OPENAI_RESOURCE_NAME = "my-resource";
    const { aiProvider } = loadProvider();

    expect(aiProvider.provider).toBe("azure");
  });

  it("needs both the Azure key and resource name before it counts as configured", () => {
    mockEnv.AZURE_OPENAI_API_KEY = "azure-key";
    const { aiProvider } = loadProvider();

    expect(aiProvider.provider).toBe("none");
  });

  // The label is persisted and returned over the API to say whether AI or the
  // parser ran -- not which vendor served it.
  it("labels Azure extractions as openai, not azure", () => {
    mockEnv.AZURE_OPENAI_API_KEY = "azure-key";
    mockEnv.AZURE_OPENAI_RESOURCE_NAME = "my-resource";
    const { aiProvider } = loadProvider();

    expect(aiProvider.getExtractionProviderLabel()).toBe("openai");
  });

  it("falls back to the deployment name for the model id on Azure", async () => {
    mockEnv.AZURE_OPENAI_API_KEY = "azure-key";
    mockEnv.AZURE_OPENAI_RESOURCE_NAME = "my-resource";
    mockEnv.AZURE_OPENAI_DEPLOYMENT = "gpt-4o-mini";
    const { aiProvider } = loadProvider();

    await expect(aiProvider.getModel()).resolves.toBe("stub-azure-model");
  });

  // A reasoning model left at its default effort spends the whole completion
  // budget thinking and returns an empty string, which reads as a model
  // failure and drops the caller onto the rule-based path.
  it("wraps reasoning models so they are not left at the default effort", async () => {
    mockEnv.AZURE_OPENAI_API_KEY = "azure-key";
    mockEnv.AZURE_OPENAI_RESOURCE_NAME = "my-resource";
    mockEnv.AZURE_OPENAI_DEPLOYMENT = "gpt-5-mini";

    // require, not requireMock: the provider resolves "ai" through the
    // moduleNameMapper, and the spy has to sit on that same instance.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ai = require("ai") as { wrapLanguageModel: (...args: never[]) => unknown };
    const wrapSpy = jest.spyOn(ai, "wrapLanguageModel");

    const { aiProvider } = loadProvider();
    await aiProvider.getModel();

    expect(wrapSpy).toHaveBeenCalledTimes(1);
    const arg = wrapSpy.mock.calls[0][0] as unknown as {
      middleware: { settings: { providerOptions: Record<string, { reasoningEffort: string }> } };
    };
    expect(arg.middleware.settings.providerOptions.azure.reasoningEffort).toBe("minimal");
    expect(arg.middleware.settings.providerOptions.openai.reasoningEffort).toBe("minimal");
    wrapSpy.mockRestore();
  });

  it("leaves non-reasoning models unwrapped", async () => {
    mockEnv.OPENAI_API_KEY = "sk-test";
    mockEnv.AI_EXTRACTION_MODEL = "gpt-4o-mini";

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ai = require("ai") as { wrapLanguageModel: (...args: never[]) => unknown };
    const wrapSpy = jest.spyOn(ai, "wrapLanguageModel");

    const { aiProvider } = loadProvider();
    await expect(aiProvider.getModel()).resolves.toBe("stub-model");

    expect(wrapSpy).not.toHaveBeenCalled();
    wrapSpy.mockRestore();
  });
});
