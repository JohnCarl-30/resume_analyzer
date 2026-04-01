import { HttpError } from "../utils/http-error.js";
import { inMemoryResumeRepository } from "../repositories/in-memory-resume.repository.js";
import { createResumeSchema } from "../schemas/resume.schema.js";

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
