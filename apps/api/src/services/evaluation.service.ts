import type { ExtractedResumeProfile } from "../types/resume-extraction.js";

interface ExtractionMetrics {
  precision: number;
  recall: number;
  f1Score: number;
  fieldAccuracy: Record<string, number>;
}

interface KeywordMetrics {
  precision: number;
  recall: number;
  f1Score: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
}

interface EvaluationResult {
  extraction?: ExtractionMetrics;
  keywords?: KeywordMetrics;
  overallScore: number;
  timestamp: string;
}

/**
 * Evaluation Service
 * Measures the quality of AI extraction and keyword matching
 */
export const evaluationService = {
  /**
   * Evaluate resume extraction quality against ground truth
   */
  evaluateExtraction(
    groundTruth: ExtractedResumeProfile,
    extracted: ExtractedResumeProfile,
  ): ExtractionMetrics {
    const fields: Array<{ name: string; truth: string[]; pred: string[] }> = [
      { name: "skills", truth: groundTruth.skills, pred: extracted.skills },
      { name: "education", truth: groundTruth.education.map((e) => e.degree), pred: extracted.education.map((e) => e.degree) },
      { name: "experience", truth: groundTruth.experience.map((e) => e.role), pred: extracted.experience.map((e) => e.role) },
      { name: "projects", truth: groundTruth.projects.map((p) => p.name), pred: extracted.projects.map((p) => p.name) },
      { name: "awards", truth: groundTruth.awards, pred: extracted.awards },
    ];

    let totalPrecision = 0;
    let totalRecall = 0;
    const fieldAccuracy: Record<string, number> = {};

    for (const field of fields) {
      const truthSet = new Set(field.truth.map((t) => t.toLowerCase()));
      const predSet = new Set(field.pred.map((p) => p.toLowerCase()));

      const intersection = [...truthSet].filter((t) => predSet.has(t));
      const precision = predSet.size > 0 ? intersection.length / predSet.size : 0;
      const recall = truthSet.size > 0 ? intersection.length / truthSet.size : 0;

      totalPrecision += precision;
      totalRecall += recall;
      fieldAccuracy[field.name] = truthSet.size > 0 ? intersection.length / truthSet.size : 0;
    }

    const avgPrecision = totalPrecision / fields.length;
    const avgRecall = totalRecall / fields.length;
    const f1Score = avgPrecision + avgRecall > 0 ? (2 * avgPrecision * avgRecall) / (avgPrecision + avgRecall) : 0;

    return {
      precision: Math.round(avgPrecision * 100),
      recall: Math.round(avgRecall * 100),
      f1Score: Math.round(f1Score * 100),
      fieldAccuracy,
    };
  },

  /**
   * Evaluate keyword matching quality
   */
  evaluateKeywords(
    groundTruthKeywords: string[],
    matchedKeywords: string[],
    missingKeywords: string[],
  ): KeywordMetrics {
    const truthSet = new Set(groundTruthKeywords.map((k) => k.toLowerCase()));
    const matchedSet = new Set(matchedKeywords.map((k) => k.toLowerCase()));
    const missingSet = new Set(missingKeywords.map((k) => k.toLowerCase()));

    const truePositives = [...matchedSet].filter((k) => truthSet.has(k)).length;
    const falsePositives = [...matchedSet].filter((k) => !truthSet.has(k)).length;
    const falseNegatives = [...missingSet].filter((k) => truthSet.has(k)).length;

    const precision = truePositives + falsePositives > 0 ? truePositives / (truePositives + falsePositives) : 0;
    const recall = truePositives + falseNegatives > 0 ? truePositives / (truePositives + falseNegatives) : 0;
    const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

    return {
      precision: Math.round(precision * 100),
      recall: Math.round(recall * 100),
      f1Score: Math.round(f1Score * 100),
      truePositives,
      falsePositives,
      falseNegatives,
    };
  },

  /**
   * Run full evaluation pipeline
   */
  runEvaluation(params: {
    groundTruthExtraction?: ExtractedResumeProfile;
    predictedExtraction?: ExtractedResumeProfile;
    groundTruthKeywords?: string[];
    matchedKeywords?: string[];
    missingKeywords?: string[];
  }): EvaluationResult {
    let overallScore = 0;
    let components = 0;

    const result: EvaluationResult = {
      overallScore: 0,
      timestamp: new Date().toISOString(),
    };

    if (params.groundTruthExtraction && params.predictedExtraction) {
      result.extraction = this.evaluateExtraction(params.groundTruthExtraction, params.predictedExtraction);
      overallScore += result.extraction.f1Score;
      components++;
    }

    if (params.groundTruthKeywords && params.matchedKeywords && params.missingKeywords) {
      result.keywords = this.evaluateKeywords(params.groundTruthKeywords, params.matchedKeywords, params.missingKeywords);
      overallScore += result.keywords.f1Score;
      components++;
    }

    result.overallScore = components > 0 ? Math.round(overallScore / components) : 0;

    return result;
  },

  /**
   * Benchmark extraction service against test cases
   */
  async benchmarkExtraction<T>(
    testCases: Array<{
      input: T;
      expected: ExtractedResumeProfile;
      name: string;
    }>,
    extractFn: (input: T) => Promise<ExtractedResumeProfile>,
  ): Promise<{
    averagePrecision: number;
    averageRecall: number;
    averageF1: number;
    results: Array<{ name: string; metrics: ExtractionMetrics }>;
  }> {
    const results = [];

    for (const testCase of testCases) {
      const predicted = await extractFn(testCase.input);
      const metrics = this.evaluateExtraction(testCase.expected, predicted);
      results.push({ name: testCase.name, metrics });
    }

    const avgPrecision = results.reduce((sum, r) => sum + r.metrics.precision, 0) / results.length;
    const avgRecall = results.reduce((sum, r) => sum + r.metrics.recall, 0) / results.length;
    const avgF1 = results.reduce((sum, r) => sum + r.metrics.f1Score, 0) / results.length;

    return {
      averagePrecision: Math.round(avgPrecision),
      averageRecall: Math.round(avgRecall),
      averageF1: Math.round(avgF1),
      results,
    };
  },
};
