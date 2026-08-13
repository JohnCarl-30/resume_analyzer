/**
 * A file received from a multipart upload, independent of the HTTP framework.
 *
 * Services take this instead of a framework-specific file type, so parsing and
 * analysis stay callable from anywhere — a Node server, a test, or a Worker.
 * The field names match what the code already used when this came from multer.
 */
export interface UploadedFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}
