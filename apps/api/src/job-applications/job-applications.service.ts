import { Inject, Injectable, NotFoundException } from "@nestjs/common";

import type {
  CreateJobApplicationInput,
  UpdateJobApplicationInput,
} from "../schemas/job-application.schema.js";
import type { JobApplication } from "../types/job-application.js";
import {
  JOB_APPLICATION_REPOSITORY,
  type JobApplicationRepository,
} from "./repositories/job-application.repository.js";

/**
 * A record belonging to another user 404s rather than 403s, so the API never
 * reveals which ids exist.
 */
const NOT_FOUND = "Job application not found.";

@Injectable()
export class JobApplicationsService {
  constructor(
    @Inject(JOB_APPLICATION_REPOSITORY)
    private readonly applications: JobApplicationRepository,
  ) {}

  async list(userId: string): Promise<JobApplication[]> {
    return this.applications.list(userId);
  }

  async getById(id: string, userId: string): Promise<JobApplication> {
    const application = await this.applications.findById(id, userId);

    if (!application) {
      throw new NotFoundException(NOT_FOUND);
    }

    return application;
  }

  async create(userId: string, input: CreateJobApplicationInput): Promise<JobApplication> {
    return this.applications.create({ userId, ...input });
  }

  async update(
    id: string,
    userId: string,
    input: UpdateJobApplicationInput,
  ): Promise<JobApplication> {
    const updated = await this.applications.update(id, userId, input);

    if (!updated) {
      throw new NotFoundException(NOT_FOUND);
    }

    return updated;
  }

  async remove(id: string, userId: string): Promise<void> {
    if (!(await this.applications.remove(id, userId))) {
      throw new NotFoundException(NOT_FOUND);
    }
  }
}
