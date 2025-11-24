import { PostgreSqlContainer, type StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { afterAll, beforeAll } from "vitest";
import * as schema from "../../db/entities";

let container: StartedPostgreSqlContainer;
let pool: Pool;
let db: NodePgDatabase<typeof schema>;

export async function setupTestDatabase() {
  container = await new PostgreSqlContainer("postgres:18-alpine").start();
  pool = new Pool({ connectionString: container.getConnectionUri() });
  db = drizzle(pool, { schema });

  await pool.query("CREATE EXTENSION IF NOT EXISTS pg_trgm");
  await migrate(db, { migrationsFolder: "./drizzle" });

  return db;
}

export async function teardownTestDatabase() {
  await pool?.end();
  await container?.stop();
}

export function getTestDb() {
  return db;
}

export function setupDatabaseHooks() {
  beforeAll(async () => {
    await setupTestDatabase();
  }, 60000);

  afterAll(async () => {
    await teardownTestDatabase();
  });
}
