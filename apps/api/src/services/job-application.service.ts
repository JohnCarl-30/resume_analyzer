import { db } from "../db/client.js";
import { inMemoryJobApplicationRepository } from "../repositories/in-memory-job-application.repository.js";
import { postgresJobApplicationRepository } from "../repositories/postgres-job-application.repository.js";
import {
  createJobApplicationSchema,
  updateJobApplicationSchema,
} from "../schemas/job-application.schema.js";
import { HttpError } from "../utils/http-error.js";

const jobApplicationRepository = db.isConfigured
  ? postgresJobApplicationRepository
  : inMemoryJobApplicationRepository;

export const jobApplicationService = {
  async listApplications(userId: string) {
    return jobApplicationRepository.list(userId);
  },

  async getApplicationById(id: string, userId: string) {
    const application = await jobApplicationRepository.findById(id, userId);

    if (!application) {
      throw new HttpError(404, "Job application not found.");
    }

    return application;
  },

  async createApplication(userId: string, input: unknown) {
    const payload = createJobApplicationSchema.parse(input);

    return jobApplicationRepository.create({
      userId,
      ...payload,
    });
  },

  async updateApplication(id: string, userId: string, input: unknown) {
    const payload = updateJobApplicationSchema.parse(input);

    const updated = await jobApplicationRepository.update(id, userId, payload);

    if (!updated) {
      throw new HttpError(404, "Job application not found.");
    }

    return updated;
  },

  async deleteApplication(id: string, userId: string) {
    const removed = await jobApplicationRepository.remove(id, userId);

    if (!removed) {
      throw new HttpError(404, "Job application not found.");
    }
  },
};
