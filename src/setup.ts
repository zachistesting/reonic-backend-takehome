import "dotenv/config";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { initializeDrizzleClient, poolInstance } from "./db";
import { createLogger } from "./utils/logger";

const logger = createLogger("DATABASE");

const MIGRATIONS_FOLDER = "./drizzle";

const setup = async () => {
  logger.info("Starting Setup...");

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.error("DATABASE_URL not set");
    process.exit(1);
  }

  const drizzleClient = initializeDrizzleClient(databaseUrl);

  if (!poolInstance) {
    logger.error("Database Pool not initialized. Cannot run setup.");
    process.exit(1);
  }
  const pool = poolInstance;

  try {
    logger.info(`Applying Drizzle migrations from: ${MIGRATIONS_FOLDER}`);
    await migrate(drizzleClient, { migrationsFolder: MIGRATIONS_FOLDER });
    logger.info("Database schema migration complete!");
  } catch (error) {
    logger.error("Migrations failed");
    throw error;
  } finally {
    logger.info("Closing connection pool");
    await pool.end();
  }
};

if (require.main === module) {
  setup()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error(error, "Setup failed");
      process.exit(1);
    });
}

export { setup };
