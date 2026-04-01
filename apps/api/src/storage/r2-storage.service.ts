import { env } from "../config/env.js";
import type { CreateUploadTargetInput, ObjectStorageService } from "./object-storage.service.js";

class R2StorageService implements ObjectStorageService {
  async createUploadTarget(input: CreateUploadTargetInput) {
    const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storageKey = `resumes/${crypto.randomUUID()}-${safeFileName}`;
    const publicUrl = env.R2_PUBLIC_BASE_URL
      ? `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${storageKey}`
      : null;

    return {
      storageKey,
      uploadUrl: `https://example-upload.invalid/${env.R2_BUCKET_NAME ?? "bucket"}/${storageKey}`,
      publicUrl,
      method: "PUT" as const,
      headers: {
        "Content-Type": input.contentType,
      },
    };
  }
}

export const r2StorageService = new R2StorageService();
