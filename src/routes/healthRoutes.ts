import { sql } from "drizzle-orm";
import type { FastifyPluginAsync } from "fastify";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => {
    try {
      await app.db.execute(sql`SELECT 1`);
      return {
        status: "healthy",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      app.log.error(error, "Health check failed");
      return {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
      };
    }
  });
};
