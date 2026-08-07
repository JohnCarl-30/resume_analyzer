import { and, desc, eq } from "drizzle-orm";

import { db } from "../db/client.js";
import { jobApplicationsTable } from "../db/schema.js";
import type {
  CreateJobApplicationRecord,
  JobApplicationRepository,
  UpdateJobApplicationRecord,
} from "./job-application.repository.js";
import type { JobApplication } from "../types/job-application.js";

type JobApplicationRow = typeof jobApplicationsTable.$inferSelect;

function mapRowToApplication(row: JobApplicationRow): JobApplication {
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

class PostgresJobApplicationRepository implements JobApplicationRepository {
  async list(userId: string) {
    if (!db.client) {
      return [];
    }

    const rows = await db.client
      .select()
      .from(jobApplicationsTable)
      .where(eq(jobApplicationsTable.userId, userId))
      .orderBy(desc(jobApplicationsTable.updatedAt));

    return rows.map(mapRowToApplication);
  }

  async findById(id: string, userId: string) {
    if (!db.client) {
      return null;
    }

    const [row] = await db.client
      .select()
      .from(jobApplicationsTable)
      .where(
        and(
          eq(jobApplicationsTable.id, id),
          eq(jobApplicationsTable.userId, userId),
        ),
      )
      .limit(1);

    return row ? mapRowToApplication(row) : null;
  }

  async create(input: CreateJobApplicationRecord) {
    if (!db.client) {
      throw new Error("Database client is not configured.");
    }

    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    await db.client.insert(jobApplicationsTable).values({
      id,
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

    return {
      id,
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
    } satisfies JobApplication;
  }

  async update(id: string, userId: string, input: UpdateJobApplicationRecord) {
    if (!db.client) {
      throw new Error("Database client is not configured.");
    }

    const existing = await this.findById(id, userId);

    if (!existing) {
      return null;
    }

    const updatedAt = new Date().toISOString();

    await db.client
      .update(jobApplicationsTable)
      .set({
        company: input.company ?? existing.company,
        role: input.role ?? existing.role,
        status: input.status ?? existing.status,
        location: input.location ?? existing.location ?? null,
        jobUrl: input.jobUrl ?? existing.jobUrl ?? null,
        notes: input.notes ?? existing.notes ?? null,
        appliedAt: input.appliedAt ?? existing.appliedAt ?? null,
        analysisId: input.analysisId ?? existing.analysisId ?? null,
        updatedAt,
      })
      .where(
        and(
          eq(jobApplicationsTable.id, id),
          eq(jobApplicationsTable.userId, userId),
        ),
      );

    return {
      ...existing,
      ...input,
      updatedAt,
    } satisfies JobApplication;
  }

  async remove(id: string, userId: string) {
    if (!db.client) {
      return false;
    }

    const existing = await this.findById(id, userId);

    if (!existing) {
      return false;
    }

    await db.client
      .delete(jobApplicationsTable)
      .where(
        and(
          eq(jobApplicationsTable.id, id),
          eq(jobApplicationsTable.userId, userId),
        ),
      );

    return true;
  }
}

export const postgresJobApplicationRepository =
  new PostgresJobApplicationRepository();
