import { embeddingService } from "./embedding.service.js";
import type { PersistedResumeAnalysis } from "../repositories/analysis.repository.js";

interface SemanticMatch {
  analysisId: string;
  similarity: number;
  targetRole: string;
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
}

/**
 * Semantic Search Service
 * Performs vector similarity search between job descriptions and resumes
 */
export const semanticSearchService = {
  /**
   * Index a resume analysis with its embedding
   */
  async indexAnalysis(analysis: PersistedResumeAnalysis): Promise<{ jobEmbedding: number[]; resumeEmbedding: number[] }> {
    const [jobEmbedding, resumeEmbedding] = await Promise.all([
      embeddingService.createEmbedding(analysis.jobDescription),
      embeddingService.createEmbedding(analysis.parsedResumeText),
    ]);

    return { jobEmbedding, resumeEmbedding };
  },

  /**
   * Find semantically similar resumes for a given job description
   */
  async findSimilarResumes(
    jobDescription: string,
    indexedAnalyses: Array<{
      id: string;
      resumeEmbedding: number[];
      targetRole: string;
      score: number;
      matchedKeywords: string[];
      missingKeywords: string[];
    }>,
    topK: number = 5,
  ): Promise<SemanticMatch[]> {
    const jobEmbedding = await embeddingService.createEmbedding(jobDescription);

    const candidates = indexedAnalyses.map((analysis) => ({
      id: analysis.id,
      embedding: analysis.resumeEmbedding,
      metadata: {
        targetRole: analysis.targetRole,
        score: analysis.score,
        matchedKeywords: analysis.matchedKeywords,
        missingKeywords: analysis.missingKeywords,
      },
    }));

    const results = embeddingService.findTopKSimilar(jobEmbedding, candidates, topK);

    return results.map((result) => ({
      analysisId: result.id,
      similarity: result.similarity,
      targetRole: (result.metadata?.targetRole as string) ?? "",
      score: (result.metadata?.score as number) ?? 0,
      matchedKeywords: (result.metadata?.matchedKeywords as string[]) ?? [],
      missingKeywords: (result.metadata?.missingKeywords as string[]) ?? [],
    }));
  },

  /**
   * Find semantically similar job descriptions for a given resume
   */
  async findSimilarJobs(
    resumeText: string,
    indexedAnalyses: Array<{
      id: string;
      jobEmbedding: number[];
      targetRole: string;
      score: number;
    }>,
    topK: number = 5,
  ): Promise<Array<{ analysisId: string; similarity: number; targetRole: string; score: number }>> {
    const resumeEmbedding = await embeddingService.createEmbedding(resumeText);

    const candidates = indexedAnalyses.map((analysis) => ({
      id: analysis.id,
      embedding: analysis.jobEmbedding,
      metadata: {
        targetRole: analysis.targetRole,
        score: analysis.score,
      },
    }));

    const results = embeddingService.findTopKSimilar(resumeEmbedding, candidates, topK);

    return results.map((result) => ({
      analysisId: result.id,
      similarity: result.similarity,
      targetRole: (result.metadata?.targetRole as string) ?? "",
      score: (result.metadata?.score as number) ?? 0,
    }));
  },

  /**
   * Hybrid search: combines semantic similarity with keyword matching
   */
  async hybridSearch(
    jobDescription: string,
    resumeText: string,
    indexedAnalyses: Array<{
      id: string;
      jobEmbedding: number[];
      resumeEmbedding: number[];
      targetRole: string;
      score: number;
      matchedKeywords: string[];
      missingKeywords: string[];
    }>,
    topK: number = 5,
  ): Promise<
    Array<{
      analysisId: string;
      semanticSimilarity: number;
      keywordScore: number;
      combinedScore: number;
      targetRole: string;
    }>
  > {
    const [jobEmbedding, resumeEmbedding] = await Promise.all([
      embeddingService.createEmbedding(jobDescription),
      embeddingService.createEmbedding(resumeText),
    ]);

    const scored = indexedAnalyses.map((analysis) => {
      const jobSimilarity = embeddingService.cosineSimilarity(jobEmbedding, analysis.jobEmbedding);
      const resumeSimilarity = embeddingService.cosineSimilarity(resumeEmbedding, analysis.resumeEmbedding);
      const semanticSimilarity = (jobSimilarity + resumeSimilarity) / 2;

      // Normalize keyword score to 0-1
      const keywordScore = analysis.score / 100;

      // Combined score: 60% semantic, 40% keyword
      const combinedScore = semanticSimilarity * 0.6 + keywordScore * 0.4;

      return {
        analysisId: analysis.id,
        semanticSimilarity,
        keywordScore,
        combinedScore,
        targetRole: analysis.targetRole,
      };
    });

    return scored.sort((a, b) => b.combinedScore - a.combinedScore).slice(0, topK);
  },
};
