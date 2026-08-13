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
