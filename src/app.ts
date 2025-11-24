import cors from "@fastify/cors";
import fastifyEnv from "@fastify/env";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import fastify, { type FastifyInstance, type FastifyServerOptions } from "fastify";
import { initializeDrizzleClient } from "./db/connection";
import { routes } from "./routes";
import { envSchema } from "./types";
import { errorHandler, getLoggerConfig } from "./utils";

export async function buildApp(opts?: FastifyServerOptions): Promise<FastifyInstance> {
  const app = fastify({
    logger: getLoggerConfig(),
    bodyLimit: 1048576,
    requestTimeout: 30000,
    ...opts,
  });

  // Register env config
  await app.register(fastifyEnv, {
    confKey: "config",
    schema: envSchema,
    dotenv: true,
  });

  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  });

  // Rate limiting
  await app.register(rateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });

  // CORS
  await app.register(cors, {
    origin: app.config.CORS_ORIGIN === "*" ? true : app.config.CORS_ORIGIN.split(","),
    credentials: true,
  });

  // Initialize Database
  app.decorate("db", initializeDrizzleClient(app.config.DATABASE_URL));

  // Error handler (must be before routes)
  app.setErrorHandler(errorHandler);

  // Routes
  await app.register(routes);

  return app;
}
