import { Test } from "@nestjs/testing";

import { ProductEventsService } from "./product-events.service.js";
import { InMemoryProductEventsRepository } from "./repositories/in-memory-product-events.repository.js";
import { PRODUCT_EVENTS_REPOSITORY } from "./repositories/product-events.repository.js";

describe("ProductEventsService", () => {
  let service: ProductEventsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductEventsService,
        { provide: PRODUCT_EVENTS_REPOSITORY, useClass: InMemoryProductEventsRepository },
      ],
    }).compile();

    service = moduleRef.get(ProductEventsService);
  });

  it("stores an event against the user", async () => {
    const event = await service.track("user-1", { name: "resume_print" });

    expect(event).toMatchObject({ userId: "user-1", name: "resume_print", metadata: null });
    expect(event.id).toEqual(expect.any(String));
  });

  it("counts only the requesting user's events", async () => {
    await service.track("user-1", { name: "resume_print" });
    await service.track("user-1", { name: "resume_print" });
    await service.track("user-2", { name: "resume_export_json" });

    expect(await service.summarizeForUser("user-1")).toEqual({
      resume_print: 2,
      resume_export_json: 0,
      resume_download_original: 0,
    });
  });

  it("reports zeroes for a user with no events", async () => {
    expect(await service.summarizeForUser("nobody")).toEqual({
      resume_print: 0,
      resume_export_json: 0,
      resume_download_original: 0,
    });
  });
});
