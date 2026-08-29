/**
 * Stands in for the ESM-only "ai" / "@ai-sdk/openai" packages under Jest.
 * Suites that exercise AI behaviour override the AI_SDK provider with their
 * own stub; this exists so the module factory can resolve without crashing.
 */
module.exports = {
  generateObject: () => {
    throw new Error("AI_SDK was not stubbed in this test.");
  },
  createOpenAI: () => () => "stub-model",
};
