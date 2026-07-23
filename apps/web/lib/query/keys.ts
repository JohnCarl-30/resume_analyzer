export const queryKeys = {
  analysisQuota: ["analysis-quota"] as const,
  analyses: ["analyses"] as const,
  analysis: (id: string) => ["analysis", id] as const,
};
