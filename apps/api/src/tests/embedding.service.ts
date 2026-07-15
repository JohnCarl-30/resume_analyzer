import assert from "node:assert/strict";

import { embeddingService } from "../services/embedding.service.js";

function run() {
  console.log("Running embedding service checks...");

  const unitX = [1, 0, 0];
  const unitY = [0, 1, 0];
  const identical = [0.5, 0.5, 0.5];

  assert.ok(
    Math.abs(embeddingService.cosineSimilarity(identical, identical) - 1) < 1e-9,
    "Identical vectors should have cosine similarity of 1",
  );

  assert.ok(
    Math.abs(embeddingService.cosineSimilarity(unitX, unitY)) < 1e-9,
    "Orthogonal vectors should have cosine similarity of 0",
  );

  assert.throws(
    () => embeddingService.cosineSimilarity([1, 0], [1, 0, 0]),
    /same dimensions/,
    "Mismatched dimensions should throw",
  );

  const ranked = embeddingService.findTopKSimilar(
    [1, 0, 0],
    [
      { id: "far", embedding: [0, 1, 0] },
      { id: "close", embedding: [0.9, 0.1, 0] },
      { id: "mid", embedding: [0.5, 0.5, 0] },
    ],
    2,
  );

  assert.equal(ranked.length, 2, "findTopKSimilar should respect k");
  assert.equal(ranked[0]?.id, "close", "Closest embedding should rank first");
  assert.equal(ranked[1]?.id, "mid", "Second closest embedding should rank second");
  assert.ok(
    ranked[0]!.similarity > ranked[1]!.similarity,
    "Results should be sorted by descending similarity",
  );

  console.log("Embedding service checks passed.");
}

try {
  run();
} catch (error) {
  console.error("Embedding service checks failed.", error);
  process.exitCode = 1;
}
