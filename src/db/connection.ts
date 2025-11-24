import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { createLogger } from "../utils/logger";
import * as schema from "./entities";

const logger = createLogger("DATABASE");

const createPool = (connectionString: string) => {
  logger.info("Creating PostgreSQL connection pool...");

  const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on("error", (err) => {
    logger.error(err, "Unexpected error on idle client");
  });

  pool
    .query("SELECT 1")
    .then(() => {
      logger.info("Connection established to PostgreSQL");
    })
    .catch((err) => {
      logger.error(err, "Failed to connect to PostgreSQL");
    });

  return pool;
};

export type DrizzleClient = NodePgDatabase<typeof schema>;

let drizzleClientInstance: DrizzleClient | null = null;
let poolInstance: Pool | null = null;

export function initializeDrizzleClient(connectionString: string): DrizzleClient {
  if (!drizzleClientInstance) {
    poolInstance = createPool(connectionString);

    logger.info("Initializing Drizzle client...");
    drizzleClientInstance = drizzle(poolInstance, { schema });
  }

  return drizzleClientInstance;
}

export function getDb(): DrizzleClient {
  if (!drizzleClientInstance) {
    throw new Error("Database not initialized. Call initializeDrizzleClient first.");
  }
  return drizzleClientInstance;
}

export { poolInstance };
