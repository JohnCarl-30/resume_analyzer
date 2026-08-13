import { DataSource, type DataSourceOptions } from "typeorm";

import { env } from "../config/env.js";
import { AccountAnalysisUsageEntity } from "./entities/account-analysis-usage.entity.js";
import { JobApplicationEntity } from "./entities/job-application.entity.js";
import { ProductEventEntity } from "./entities/product-event.entity.js";
import { ResumeAnalysisEntity } from "./entities/resume-analysis.entity.js";

export const entities = [
  AccountAnalysisUsageEntity,
  JobApplicationEntity,
  ProductEventEntity,
  ResumeAnalysisEntity,
];

/**
 * Shared TypeORM configuration, used by the Nest module and the migration CLI
 * so both see exactly the same schema.
 *
 * synchronize is never enabled. It reshapes the database to match entities,
 * dropping columns it does not recognise, and this database holds real data.
 * Schema changes go through migrations, which must run against Neon's direct
 * endpoint -- DDL and session state are unreliable through the pooler.
 */
export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  url: env.DATABASE_URL,
  entities,
  migrations: [`${__dirname}/migrations/*.{ts,js}`],
  synchronize: false,
  ssl: { rejectUnauthorized: true },
};

export default new DataSource(dataSourceOptions);
