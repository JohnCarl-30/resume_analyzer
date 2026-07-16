import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env, isR2Configured } from "../config/env.js";
import type { CreateUploadTargetInput, ObjectStorageService } from "./object-storage.service.js";

class R2StorageService implements ObjectStorageService {
  private getClient(): S3Client {
    return new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID!,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }

  async createUploadTarget(input: CreateUploadTargetInput) {
    const safeFileName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
    const storageKey = `resumes/${crypto.randomUUID()}-${safeFileName}`;
    const publicUrl = env.R2_PUBLIC_BASE_URL
      ? `${env.R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${storageKey}`
      : null;

    if (!isR2Configured()) {
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

    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME!,
      Key: storageKey,
      ContentType: input.contentType,
    });

    const uploadUrl = await getSignedUrl(this.getClient(), command, { expiresIn: 3600 });

    return {
      storageKey,
      uploadUrl,
      publicUrl,
      method: "PUT" as const,
      headers: {
        "Content-Type": input.contentType,
      },
    };
  }
}

export const r2StorageService = new R2StorageService();
