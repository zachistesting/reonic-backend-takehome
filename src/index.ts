import { buildApp } from "./app";
import { createLogger } from "./utils/logger";

const logger = createLogger("APP");

const main = async () => {
  logger.info("Invoice Service Starting...");

  try {
    const app = await buildApp();

    const address = await app.listen({
      port: app.config.PORT,
      host: "0.0.0.0",
    });

    logger.info(`[${app.config.NODE_ENV}] Server listening at ${address}`);
  } catch (err) {
    logger.error(err, "Failed to start server");
    process.exit(1);
  }
};

if (require.main === module) {
  main().catch((err) => {
    logger.error(err, "Failed to start server");
    process.exit(1);
  });
}
