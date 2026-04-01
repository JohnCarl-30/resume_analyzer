import { r2StorageService } from "../storage/r2-storage.service.js";
import { createUploadTargetSchema } from "../schemas/upload.schema.js";

export const uploadService = {
  async createUploadTarget(input: unknown) {
    const payload = createUploadTargetSchema.parse(input);
    return r2StorageService.createUploadTarget(payload);
  },
};
