import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";

import type { JobApplication } from "../../types/job-application.js";
import type {
  CreateJobApplicationRecord,
  JobApplicationRepository,
  UpdateJobApplicationRecord,
} from "./job-application.repository.js";

/** Used when no database is configured. Applications vanish with the process. */
@Injectable()
export class InMemoryJobApplicationRepository implements JobApplicationRepository {
  private readonly applications = new Map<string, JobApplication>();

  async list(userId: string): Promise<JobApplication[]> {
    return Array.from(this.applications.values())
      .filter((application) => application.userId === userId)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  async findById(id: string, userId: string): Promise<JobApplication | null> {
    const application = this.applications.get(id);
    return application && application.userId === userId ? application : null;
  }

  async create(input: CreateJobApplicationRecord): Promise<JobApplication> {
    const now = new Date().toISOString();
    const application: JobApplication = {
      id: randomUUID(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };

    this.applications.set(application.id, application);
    return application;
  }

  async update(
    id: string,
    userId: string,
    input: UpdateJobApplicationRecord,
  ): Promise<JobApplication | null> {
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

  async remove(id: string, userId: string): Promise<boolean> {
    const existing = await this.findById(id, userId);

    if (!existing) {
      return false;
    }

    return this.applications.delete(id);
  }
}
