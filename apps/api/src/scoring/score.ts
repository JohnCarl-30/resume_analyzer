export interface ScoringInput {
  /** 0–100 normalized keyword match score */
  keywordScore: number;
  /** Number of required skills matched vs total required */
  requiredSkillsMatched: number;
  requiredSkillsTotal: number;
  /** Writing quality penalty (0–20) */
  writingPenalty: number;
  /** Impact metrics penalty (0–10) */
  impactPenalty: number;
  /** Number of high-severity suggestions */
  highSeverityCount: number;
}

export interface ScoringResult {
  score: number;
  breakdown: {
    keywordComponent: number;
    requiredSkillsComponent: number;
    writingDeduction: number;
    impactDeduction: number;
    severityDeduction: number;
  };
}

/**
 * Weighted scoring formula:
 *
 *   Score = (keyword match ×0.45) + (required skills ×0.35) + (base ×0.20)
 *           − writing penalty − impact penalty − severity deduction
 *
 * Clamped to [20, 98] — never 0 (harsh) or 100 (perfect is unrealistic).
 *
 * Weights rationale:
 *   - Keyword match (45%): covers general alignment with JD language
 *   - Required skills (35%): hard requirements from the JD carry more weight
 *   - Base (20%): ensures a floor for a well-written but niche resume
 */
export function computeScore(input: ScoringInput): ScoringResult {
  const {
    keywordScore,
    requiredSkillsMatched,
    requiredSkillsTotal,
    writingPenalty,
    impactPenalty,
    highSeverityCount,
  } = input;

  // Component scores (each 0–100)
  const keywordComponent = keywordScore * 0.45;

  const requiredSkillsRatio =
    requiredSkillsTotal > 0
      ? (requiredSkillsMatched / requiredSkillsTotal) * 100
      : keywordScore; // fallback if JD had no explicit required skills
  const requiredSkillsComponent = requiredSkillsRatio * 0.35;

  const baseComponent = 20; // baseline for format/structure credit

  // Deductions
  const writingDeduction = Math.min(writingPenalty, 15);
  const impactDeduction = Math.min(impactPenalty, 10);
  const severityDeduction = Math.min(highSeverityCount * 3, 12);

  const raw =
    keywordComponent +
    requiredSkillsComponent +
    baseComponent -
    writingDeduction -
    impactDeduction -
    severityDeduction;

  const score = Math.round(Math.max(20, Math.min(98, raw)));

  return {
    score,
    breakdown: {
      keywordComponent: Math.round(keywordComponent),
      requiredSkillsComponent: Math.round(requiredSkillsComponent),
      writingDeduction,
      impactDeduction,
      severityDeduction,
    },
  };
}
