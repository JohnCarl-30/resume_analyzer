import type { Context } from "hono";

import type { UploadedFile } from "../types/uploaded-file.js";
import { HttpError } from "./http-error.js";

interface MultipartLimits {
  /** Largest accepted size for the file field itself. */
  maxFileBytes: number;
  /** Headroom over maxFileBytes for the other fields and MIME framing. */
  maxRequestBytes: number;
  isSupportedMimeType: (mimeType: string) => boolean;
  tooLargeMessage: string;
  unsupportedTypeMessage: string;
}

/**
 * Read a multipart form, replacing what multer used to do at the route layer.
 *
 * Unlike multer this cannot reject mid-stream — `formData()` buffers the whole
 * body before anything is inspectable. The Content-Length check below turns an
 * oversized upload away before that happens, which is what keeps a huge POST
 * from being read into memory just to be rejected afterwards.
 */
export async function readMultipartForm(
  c: Context,
  fileFieldName: string,
  limits: MultipartLimits,
): Promise<{ fields: Record<string, string>; file?: UploadedFile }> {
  const declaredLength = Number(c.req.header("Content-Length") ?? "0");

  if (Number.isFinite(declaredLength) && declaredLength > limits.maxRequestBytes) {
    throw new HttpError(400, limits.tooLargeMessage);
  }

  let form: FormData;

  try {
    form = await c.req.formData();
  } catch {
    throw new HttpError(400, "Expected a multipart form upload.");
  }

  const fields: Record<string, string> = {};
  let file: UploadedFile | undefined;

  for (const [key, value] of form.entries()) {
    if (typeof value === "string") {
      fields[key] = value;
      continue;
    }

    if (key !== fileFieldName) {
      continue;
    }

    if (value.size > limits.maxFileBytes) {
      throw new HttpError(400, limits.tooLargeMessage);
    }

    if (!limits.isSupportedMimeType(value.type)) {
      throw new HttpError(400, limits.unsupportedTypeMessage);
    }

    file = {
      buffer: Buffer.from(await value.arrayBuffer()),
      mimetype: value.type,
      originalname: value.name,
    };
  }

  return { fields, file };
}
