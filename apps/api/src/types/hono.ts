/**
 * The Hono environment every route shares.
 *
 * `userId` is set by the requireAuth middleware, so any handler mounted behind
 * it can read `c.get("userId")` and get a string rather than `string | undefined`.
 */
export type AppEnv = {
  Variables: {
    userId: string;
  };
};
