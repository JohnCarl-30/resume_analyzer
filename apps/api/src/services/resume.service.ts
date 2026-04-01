import { z } from "zod";

import { HttpError } from "../utils/http-error.js";
import { inMemoryResumeRepository } from "../repositories/in-memory-resume.repository.js";

const createResumeSchema = z.object({
  fileName: z.string().min(1),
  storageKey: z.string().min(1),
  candidateName: z.string().min(1),
  status: z.enum(["uploaded", "processing", "analyzed"]).default("uploaded"),
});

export const resumeService = {
  async listResumes() {
    return inMemoryResumeRepository.list();
  },

  async getResumeById(resumeId: string) {
    const resume = await inMemoryResumeRepository.findById(resumeId);

    if (!resume) {
      throw new HttpError(404, "Resume not found");
    }

    return resume;
  },

  async createResume(input: unknown) {
    const payload = createResumeSchema.parse(input);

    return inMemoryResumeRepository.create({
      ...payload,
      uploadedAt: new Date().toISOString(),
    });
  },
};
