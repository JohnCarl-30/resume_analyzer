import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "node:crypto";
import { Repository } from "typeorm";

import { JobApplicationEntity } from "../../database/entities/job-application.entity.js";
import type { JobApplication } from "../../types/job-application.js";
import type {
  CreateJobApplicationRecord,
  JobApplicationRepository,
  UpdateJobApplicationRecord,
} from "./job-application.repository.js";

/** The API's optional fields are undefined; the table stores them as NULL. */
function mapEntity(row: JobApplicationEntity): JobApplication {
  return {
    id: row.id,
    userId: row.userId,
    company: row.company,
    role: row.role,
    status: row.status,
    location: row.location ?? undefined,
    jobUrl: row.jobUrl ?? undefined,
    notes: row.notes ?? undefined,
    appliedAt: row.appliedAt ?? undefined,
    analysisId: row.analysisId ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

@Injectable()
export class TypeOrmJobApplicationRepository implements JobApplicationRepository {
  constructor(
    @InjectRepository(JobApplicationEntity)
    private readonly applications: Repository<JobApplicationEntity>,
  ) {}

  async list(userId: string): Promise<JobApplication[]> {
    const rows = await this.applications.find({
      where: { userId },
      // updated_at is text holding ISO strings, so lexical order is time order.
      order: { updatedAt: "DESC" },
    });

    return rows.map(mapEntity);
  }

  async findById(id: string, userId: string): Promise<JobApplication | null> {
    const row = await this.applications.findOne({ where: { id, userId } });
    return row ? mapEntity(row) : null;
  }

  async create(input: CreateJobApplicationRecord): Promise<JobApplication> {
    const now = new Date().toISOString();

    const saved = await this.applications.save({
      id: randomUUID(),
      userId: input.userId,
      company: input.company,
      role: input.role,
      status: input.status,
      location: input.location ?? null,
      jobUrl: input.jobUrl ?? null,
      notes: input.notes ?? null,
      appliedAt: input.appliedAt ?? null,
      analysisId: input.analysisId ?? null,
      createdAt: now,
      updatedAt: now,
    });

    return mapEntity(saved as JobApplicationEntity);
  }

  async update(
    id: string,
    userId: string,
    input: UpdateJobApplicationRecord,
  ): Promise<JobApplication | null> {
    const existing = await this.applications.findOne({ where: { id, userId } });

    if (!existing) {
      return null;
    }

    // Only supplied fields change; an absent field keeps its stored value.
    const merged: JobApplicationEntity = {
      ...existing,
      company: input.company ?? existing.company,
      role: input.role ?? existing.role,
      status: input.status ?? existing.status,
      location: input.location ?? existing.location,
      jobUrl: input.jobUrl ?? existing.jobUrl,
      notes: input.notes ?? existing.notes,
      appliedAt: input.appliedAt ?? existing.appliedAt,
      analysisId: input.analysisId ?? existing.analysisId,
      updatedAt: new Date().toISOString(),
    };

    await this.applications.save(merged);
    return mapEntity(merged);
  }

  async remove(id: string, userId: string): Promise<boolean> {
    const result = await this.applications.delete({ id, userId });
    return (result.affected ?? 0) > 0;
  }
}
