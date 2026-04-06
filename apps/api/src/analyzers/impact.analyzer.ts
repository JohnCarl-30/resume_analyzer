import type { AnalysisSuggestion } from "../types/analysis.js";

export interface ImpactAnalysisResult {
  suggestions: AnalysisSuggestion[];
  penalty: number;
  metricsFound: number;
}

// Patterns for quantifiable impact
const METRIC_PATTERNS: RegExp[] = [
  /\b\d+(\.\d+)?%/i,                                              // "40%", "3.5%"
  /\b\d+[kmb]\b/i,                                                // "10k", "2m users"
  /\b\d+\s?(users|clients|customers|requests|rps|qps)\b/i,       // "50 users"
  /\b\d+\s?(projects|services|apis|endpoints|features)\b/i,      // "12 features"
  /\b\d+\s?(hours|days|weeks|months)\b/i,                        // "3 hours"
  /\b\d+x\s?(faster|improvement|increase|reduction|speedup)\b/i, // "3x faster"
  /\breduced\s+by\s+\d+/i,                                        // "reduced by 40"
  /\bsaved\s+\d+/i,                                               // "saved 20 hours"
  /\bincreased\s+\w+\s+by\s+\d+/i,                               // "increased X by 50"
  /\bteam\s+of\s+\d+/i,                                           // "team of 8"
  /\bscaled\s+to\s+\d+/i,                                         // "scaled to 10k"
  /\b(doubled|tripled|halved)\b/i,                                // relative multipliers
];

/**
 * Counts distinct impact metric matches across multiple pattern types.
 * Avoids double-counting overlapping matches.
 */
export function analyzeImpactMetrics(resumeText: string): ImpactAnalysisResult {
  const suggestions: AnalysisSuggestion[] = [];

  const matchedRanges = new Set<string>();

  for (const pattern of METRIC_PATTERNS) {
    const matches = [...resumeText.matchAll(new RegExp(pattern.source, "gi"))];
    for (const match of matches) {
      if (match.index !== undefined) {
        // Deduplicate by position range
        matchedRanges.add(`${match.index}-${match.index + match[0].length}`);
      }
    }
  }

  const metricsFound = matchedRanges.size;

  if (metricsFound === 0) {
    suggestions.push({
      id: "add-metrics",
      title: "Add measurable impact",
      detail:
        "No quantifiable results detected. Add metrics like percentages, user counts, latency improvements, or team sizes so accomplishments are concrete and verifiable.",
      severity: "high",
      category: "impact",
    });
  } else if (metricsFound < 3) {
    suggestions.push({
      id: "expand-metrics",
      title: "Add more impact metrics",
      detail: `Only ${metricsFound} measurable result(s) found. Aim for at least one metric per bullet point in your experience section.`,
      severity: "medium",
      category: "impact",
    });
  }

  const penalty = metricsFound === 0 ? 10 : metricsFound < 3 ? 4 : 0;

  return { suggestions, penalty, metricsFound };
}
