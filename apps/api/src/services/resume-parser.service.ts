import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";

import { HttpError } from "../utils/http-error.js";

const supportedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

function normalizeExtractedText(text: string) {
  return text
    .replace(/\u0000/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isSupportedMimeType(value: string) {
  return supportedMimeTypes.includes(
    value as (typeof supportedMimeTypes)[number],
  );
}

export const resumeParserService = {
  isSupportedMimeType,

  async extractText(file: Express.Multer.File) {
    if (!file.buffer?.length) {
      throw new HttpError(400, "The uploaded resume is empty.");
    }

    if (file.mimetype === "application/pdf") {
      const pdf = await getDocumentProxy(new Uint8Array(file.buffer));
      const { text } = await extractText(pdf, { mergePages: true });

      return {
        text: normalizeExtractedText(text),
        contentType: file.mimetype,
      };
    }

    if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ buffer: file.buffer });

      return {
        text: normalizeExtractedText(result.value),
        contentType: file.mimetype,
      };
    }

    throw new HttpError(
      400,
      "Please upload a PDF or DOCX resume so we can extract the text.",
    );
  },
};
