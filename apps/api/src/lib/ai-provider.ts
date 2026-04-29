import { createVertex } from "@ai-sdk/google-vertex";
import { env } from "../config/env.js";

export const vertex = createVertex({
  project: env.GCP_PROJECT_ID,
  location: env.GCP_LOCATION,
});

export const aiProvider = {
  provider: "google-vertex" as const,

  isEnabled() {
    return Boolean(env.GCP_PROJECT_ID);
  },

  getModel(modelId?: string) {
    return vertex(modelId ?? env.AI_EXTRACTION_MODEL);
  },
};
