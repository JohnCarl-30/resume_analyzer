import { env } from "../config/env.js";
import { HttpError } from "../utils/http-error.js";

/**
 * OpenAI Embedding Service
 * Generates vector embeddings for text using OpenAI's text-embedding-3-small model
 */
export const embeddingService = {
  async createEmbedding(text: string): Promise<number[]> {
    if (!env.OPENAI_API_KEY) {
      throw new HttpError(500, "OPENAI_API_KEY is not configured for embeddings");
    }

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        input: text.slice(0, 8000), // OpenAI has token limits
        model: "text-embedding-3-small",
        dimensions: 1536,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new HttpError(502, `Embedding API error: ${error}`);
    }

    const data = (await response.json()) as {
      data: [{ embedding: number[] }];
    };

    return data.data[0].embedding;
  },

  async createEmbeddings(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((text) => this.createEmbedding(text)));
  },

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error("Embeddings must have the same dimensions");
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  },

  /**
   * Find top-k most similar embeddings
   */
  findTopKSimilar(
    queryEmbedding: number[],
    candidates: { id: string; embedding: number[]; metadata?: Record<string, unknown> }[],
    k: number = 5,
  ): Array<{ id: string; similarity: number; metadata?: Record<string, unknown> }> {
    const scored = candidates.map((candidate) => ({
      id: candidate.id,
      similarity: this.cosineSimilarity(queryEmbedding, candidate.embedding),
      metadata: candidate.metadata,
    }));

    return scored.sort((a, b) => b.similarity - a.similarity).slice(0, k);
  },
};
