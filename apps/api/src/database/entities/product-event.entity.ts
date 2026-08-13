import { Column, Entity, Index, PrimaryColumn } from "typeorm";

@Entity({ name: "product_events" })
@Index("product_events_user_name_idx", ["userId", "name"])
export class ProductEventEntity {
  @PrimaryColumn({ type: "text" })
  id!: string;

  @Column({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ name: "analysis_id", type: "text", nullable: true })
  analysisId!: string | null;

  @Column({ type: "text" })
  name!: string;

  @Column({ type: "jsonb", nullable: true })
  metadata!: Record<string, unknown> | null;

  @Column({ name: "created_at", type: "timestamptz", default: () => "now()" })
  createdAt!: Date;
}
