import type { AnalysisSuggestion } from "../types/analysis.js";

const WEAK_ACTION_PHRASES = [
  "worked on",
  "helped with",
  "responsible for",
  "tasked with",
  "assisted with",
  "involved in",
  "participated in",
  "contributed to",
] as const;

const STRONG_VERB_EXAMPLES = ["built", "led", "improved", "designed", "architected", "reduced", "shipped", "launched"];

export interface WritingAnalysisResult {
  suggestions: AnalysisSuggestion[];
  penalty: number;
  foundWeakPhrases: string[];
}

/**
 * Detects ALL weak action phrases in the resume (not just the first one).
 * Each unique weak phrase found generates its own suggestion detail.
 */
export function analyzeWritingQuality(resumeText: string): WritingAnalysisResult {
  const normalized = resumeText.toLowerCase();
  const suggestions: AnalysisSuggestion[] = [];

  const foundWeakPhrases = WEAK_ACTION_PHRASES.filter((phrase) =>
    normalized.includes(phrase),
  );

  if (foundWeakPhrases.length > 0) {
    const phraseList = foundWeakPhrases.map((p) => `"${p}"`).join(", ");
    const exampleVerbs = STRONG_VERB_EXAMPLES.slice(0, 3).join('", "');

    suggestions.push({
      id: "stronger-verbs",
      title: "Replace weak action phrases",
      detail: `Found ${foundWeakPhrases.length} weak phrase(s): ${phraseList}. Replace with ownership verbs like "${exampleVerbs}".`,
      severity: foundWeakPhrases.length >= 3 ? "high" : "medium",
      category: "writing",
    });
  }

  // Check for passive voice patterns
  const passiveMatches = resumeText.match(/\b(was|were|been|is|are)\s+\w+ed\b/gi) ?? [];
  if (passiveMatches.length >= 3) {
    suggestions.push({
      id: "passive-voice",
      title: "Reduce passive voice",
      detail: `Detected ${passiveMatches.length} passive constructions. Rewrite in active voice to show direct ownership of outcomes.`,
      severity: "low",
      category: "writing",
    });
  }

  const penalty = foundWeakPhrases.length * 3 + (passiveMatches.length >= 3 ? 2 : 0);

  return { suggestions, penalty, foundWeakPhrases };
}
