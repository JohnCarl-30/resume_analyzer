import { Column, Entity, Index, PrimaryColumn } from "typeorm";

import type { JobApplicationStatus } from "../../types/job-application.js";

/**
 * Timestamps here are text, not timestamptz, unlike every other table. That
 * mirrors the live schema: the columns were created as text and hold ISO
 * strings. Changing them is a deliberate migration, not something the entity
 * should quietly correct.
 */
@Entity({ name: "job_applications" })
@Index("job_applications_user_updated_idx", ["userId", "updatedAt"])
export class JobApplicationEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ type: "text" })
  company!: string;

  @Column({ type: "text" })
  role!: string;

  @Column({ type: "text" })
  status!: JobApplicationStatus;

  @Column({ type: "text", nullable: true })
  location!: string | null;

  @Column({ name: "job_url", type: "text", nullable: true })
  jobUrl!: string | null;

  @Column({ type: "text", nullable: true })
  notes!: string | null;

  @Column({ name: "applied_at", type: "text", nullable: true })
  appliedAt!: string | null;

  @Column({ name: "analysis_id", type: "text", nullable: true })
  analysisId!: string | null;

  @Column({ name: "created_at", type: "text" })
  createdAt!: string;

  @Column({ name: "updated_at", type: "text" })
  updatedAt!: string;
}
