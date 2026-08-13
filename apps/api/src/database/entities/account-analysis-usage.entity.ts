import { Column, Entity, PrimaryColumn } from "typeorm";

/** One row per account, recording the single free analysis it has redeemed. */
@Entity({ name: "account_analysis_usage" })
export class AccountAnalysisUsageEntity {
  @PrimaryColumn({ name: "user_id", type: "text" })
  userId!: string;

  @Column({ name: "analysis_id", type: "text" })
  analysisId!: string;

  @Column({ name: "redeemed_at", type: "timestamptz", default: () => "now()" })
  redeemedAt!: Date;
}
