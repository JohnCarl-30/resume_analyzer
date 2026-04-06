export interface KeywordAnalysisResult {
  matchedKeywords: string[];
  missingKeywords: string[];
  keywordScore: number;
}

const stopWords = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "must", "shall", "can", "not", "no", "nor",
  "so", "yet", "both", "either", "neither", "each", "few", "more", "most",
  "other", "some", "such", "than", "too", "very", "just", "as", "if",
  "then", "that", "this", "these", "those", "it", "its", "we", "our",
  "you", "your", "they", "their", "he", "she", "his", "her", "who",
  "which", "what", "when", "where", "how", "why", "all", "any", "into",
  "through", "during", "before", "after", "above", "below", "between",
  "out", "up", "down", "about", "against", "work", "working", "strong",
  "good", "great", "well", "also", "including", "experience", "role",
  "team", "ability", "skills", "knowledge", "understanding", "using",
  "use", "used", "across", "within", "while", "able", "own",
]);

/**
 * Extracts candidate keywords from a job description using simple NLP heuristics.
 * Filters out stop words and short tokens, returning meaningful technical/domain terms.
 */
export function extractJdKeywords(jobDescription: string): string[] {
  const normalized = jobDescription.toLowerCase();

  // Extract multi-word technical terms first (e.g. "machine learning", "ci/cd", "next.js")
  const multiWordPatterns = normalized.match(
    /\b(?:machine learning|deep learning|natural language processing|large language models?|ci\/cd|next\.js|node\.js|type\s?script|react native|rest(?:ful)? api|graphql|aws lambda|google cloud|azure devops|data science|full[- ]?stack)\b/gi,
  ) ?? [];

  // Extract single tokens (min 3 chars, allow dots/slashes for tech terms)
  const tokens = normalized
    .replace(/[^a-z0-9./#+ ]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !stopWords.has(token));

  const combined = [...multiWordPatterns.map((t) => t.toLowerCase()), ...tokens];

  // Deduplicate while preserving order
  const seen = new Set<string>();
  return combined.filter((kw) => {
    if (seen.has(kw)) return false;
    seen.add(kw);
    return true;
  });
}

/**
 * Scores keyword matches using diminishing returns per keyword.
 * A keyword mentioned once is worth 8pts. Repeated mentions add up to 3pts more.
 */
export function analyzeKeywords(
  resumeText: string,
  jobDescription: string,
  options?: { jdKeywords?: string[] },
): KeywordAnalysisResult {
  const normalizedResume = resumeText.toLowerCase();
  const normalizedJd = jobDescription.toLowerCase();

  const jdKeywords = options?.jdKeywords ?? extractJdKeywords(normalizedJd);

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  let keywordScore = 0;

  for (const keyword of jdKeywords) {
    const inResume = normalizedResume.includes(keyword);

    if (inResume) {
      matchedKeywords.push(keyword);

      // Count occurrences for diminishing returns scoring
      const occurrences = (normalizedResume.match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? []).length;
      const points = 8 + Math.min(occurrences - 1, 2) * 1.5; // max 11 per keyword
      keywordScore += points;
    } else {
      missingKeywords.push(keyword);
    }
  }

  // Normalize score relative to how many JD keywords exist
  const maxPossible = jdKeywords.length * 11;
  const normalized = maxPossible > 0 ? (keywordScore / maxPossible) * 100 : 0;

  return {
    matchedKeywords: Array.from(new Set(matchedKeywords)).sort(),
    missingKeywords: Array.from(new Set(missingKeywords)).sort(),
    keywordScore: Math.round(normalized),
  };
}
