import { describe, expect, it } from "vitest";

import { inMemoryProductEventsRepository } from "../repositories/in-memory-product-events.repository.js";
import { createProductEventSchema } from "../schemas/product-event.schema.js";

describe("product events", () => {
  it("validates known event names", () => {
    expect(
      createProductEventSchema.parse({
        name: "resume_print",
        analysisId: "analysis-1",
      }),
    ).toEqual({
      name: "resume_print",
      analysisId: "analysis-1",
    });

    expect(() => createProductEventSchema.parse({ name: "not_a_real_event" })).toThrow();
  });

  it("counts tracked events per user in memory", async () => {
    const userId = `user-${crypto.randomUUID()}`;
    const analysisId = `analysis-${crypto.randomUUID()}`;

    await inMemoryProductEventsRepository.create({
      userId,
      analysisId,
      name: "resume_print",
    });
    await inMemoryProductEventsRepository.create({
      userId,
      name: "resume_export_json",
      metadata: { templateId: "harvard" },
    });
    await inMemoryProductEventsRepository.create({
      userId,
      analysisId,
      name: "resume_download_original",
    });
    await inMemoryProductEventsRepository.create({
      userId,
      analysisId,
      name: "resume_print",
    });
    await inMemoryProductEventsRepository.create({
      userId: `user-${crypto.randomUUID()}`,
      name: "resume_print",
    });

    await expect(inMemoryProductEventsRepository.countByUser(userId)).resolves.toEqual({
      resume_print: 2,
      resume_export_json: 1,
      resume_download_original: 1,
    });
  });
});
