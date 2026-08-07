import type {
  CreateJobApplicationRecord,
  JobApplicationRepository,
  UpdateJobApplicationRecord,
} from "./job-application.repository.js";
import type { JobApplication } from "../types/job-application.js";

class InMemoryJobApplicationRepository implements JobApplicationRepository {
  private readonly applications = new Map<string, JobApplication>();

  async list(userId: string) {
    return Array.from(this.applications.values())
      .filter((application) => application.userId === userId)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  async findById(id: string, userId: string) {
    const application = this.applications.get(id);

    if (!application || application.userId !== userId) {
      return null;
    }

    return application;
  }

  async create(input: CreateJobApplicationRecord) {
    const now = new Date().toISOString();
    const application: JobApplication = {
      id: crypto.randomUUID(),
      userId: input.userId,
      company: input.company,
      role: input.role,
      status: input.status,
      location: input.location,
      jobUrl: input.jobUrl,
      notes: input.notes,
      appliedAt: input.appliedAt,
      analysisId: input.analysisId,
      createdAt: now,
      updatedAt: now,
    };

    this.applications.set(application.id, application);

    return application;
  }

  async update(id: string, userId: string, input: UpdateJobApplicationRecord) {
    const existing = await this.findById(id, userId);

    if (!existing) {
      return null;
    }

    const updated: JobApplication = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };

    this.applications.set(id, updated);

    return updated;
  }

  async remove(id: string, userId: string) {
    const existing = await this.findById(id, userId);

    if (!existing) {
      return false;
    }

    return this.applications.delete(id);
  }
}

export const inMemoryJobApplicationRepository =
  new InMemoryJobApplicationRepository();
