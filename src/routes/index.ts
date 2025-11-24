import type { FastifyPluginAsync } from "fastify";
import { healthRoutes } from "./healthRoutes";
import { invoicesRoutes } from "./invoiceRoutes";

export const routes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes);
  await app.register(invoicesRoutes);
};
