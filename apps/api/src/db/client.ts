export interface DatabaseClient {
  kind: "drizzle";
}

export const db: DatabaseClient = {
  kind: "drizzle",
};
