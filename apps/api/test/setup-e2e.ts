/**
 * End-to-end tests boot the real AppModule, which would otherwise connect to
 * whatever DATABASE_URL points at -- in practice the production database.
 *
 * Setting it to an empty string before anything loads keeps DatabaseModule
 * from importing TypeOrmModule, so feature modules resolve their in-memory
 * repositories instead. dotenv does not override variables that are already
 * present, so this also survives .env being loaded afterwards.
 */
process.env.DATABASE_URL = "";

/**
 * Authentication is deliberately left unconfigured too.
 *
 * A machine with a real CLERK_SECRET_KEY in .env would otherwise take a
 * different branch through the guard than CI, which has none -- so the same
 * suite would assert different behaviour in the two places.
 */
process.env.CLERK_SECRET_KEY = "";
