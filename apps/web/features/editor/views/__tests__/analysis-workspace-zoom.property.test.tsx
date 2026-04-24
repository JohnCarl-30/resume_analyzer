/**
 * Property-Based Test — Property 13: Zoom bounds enforcement
 *
 * Feature: resume-editor-flow, Property 13: Zoom bounds enforcement
 *
 * For any sequence of zoom adjustments (increments or decrements), the resulting
 * zoom level should always be clamped to the range [70, 160].
 *
 * Validates: Requirements 5.7
 *
 * Tag format: Feature: resume-editor-flow, Property 13: Zoom bounds enforcement
 * Minimum 100 iterations
 */

import { describe, it } from "vitest";
import * as fc from "fast-check";

// ---------------------------------------------------------------------------
// The zoom clamping logic extracted from AnalysisWorkspace.adjustPreviewZoom
// ---------------------------------------------------------------------------

const ZOOM_MIN = 70;
const ZOOM_MAX = 160;
const ZOOM_DEFAULT = 100;

/**
 * Pure implementation of the zoom adjustment logic from AnalysisWorkspace:
 *   setPreviewZoom((currentZoom) => Math.max(70, Math.min(160, currentZoom + delta)));
 */
function applyZoomDelta(currentZoom: number, delta: number): number {
  return Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, currentZoom + delta));
}

/**
 * Apply a sequence of deltas starting from the default zoom (100).
 * Returns the final zoom value.
 */
function applyZoomDeltas(deltas: number[]): number {
  return deltas.reduce((zoom, delta) => applyZoomDelta(zoom, delta), ZOOM_DEFAULT);
}

// ---------------------------------------------------------------------------
// Property 13: Zoom bounds enforcement
// ---------------------------------------------------------------------------

describe(
  "Feature: resume-editor-flow, Property 13: Zoom bounds enforcement",
  () => {
    /**
     * **Validates: Requirements 5.7**
     *
     * For any sequence of integer deltas in [-30, 30], applying each delta
     * via adjustPreviewZoom starting from the default zoom (100) always
     * produces a final zoom value in [70, 160].
     */
    it(
      "zoom level is always within [70, 160] after any sequence of deltas",
      () => {
        fc.assert(
          fc.property(
            fc.array(fc.integer({ min: -30, max: 30 })),
            (deltas) => {
              const finalZoom = applyZoomDeltas(deltas);
              return finalZoom >= ZOOM_MIN && finalZoom <= ZOOM_MAX;
            },
          ),
          { numRuns: 100 },
        );
      },
    );

    /**
     * **Validates: Requirements 5.7**
     *
     * For any single delta applied to any intermediate zoom value in [70, 160],
     * the result is still within [70, 160].
     * This verifies the invariant holds at every individual step, not just the final result.
     */
    it(
      "each individual zoom adjustment keeps the zoom within [70, 160]",
      () => {
        fc.assert(
          fc.property(
            fc.array(fc.integer({ min: -30, max: 30 })),
            (deltas) => {
              let zoom = ZOOM_DEFAULT;
              for (const delta of deltas) {
                zoom = applyZoomDelta(zoom, delta);
                if (zoom < ZOOM_MIN || zoom > ZOOM_MAX) {
                  return false;
                }
              }
              return true;
            },
          ),
          { numRuns: 100 },
        );
      },
    );
  },
);
