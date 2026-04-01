import { z } from "zod";

import { r2StorageService } from "../storage/r2-storage.service.js";

const createUploadTargetSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
});

export const uploadService = {
  async createUploadTarget(input: unknown) {
    const payload = createUploadTargetSchema.parse(input);
    return r2StorageService.createUploadTarget(payload);
  },
};
