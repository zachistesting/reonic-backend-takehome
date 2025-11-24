import type { DrizzleClient } from "../db";
import type { CustomerRepository } from "../repositories/CustomerRepository";
import type { InvoiceRepository } from "../repositories/InvoiceRepository";
import type { InvoiceService } from "../services/InvoiceService";

declare module "fastify" {
  interface FastifyInstance {
    config: {
      DATABASE_URL: string;
      NODE_ENV: string;
      PORT: number;
      LOG_LEVEL: string;
      CORS_ORIGIN: string;
    };
    db: DrizzleClient;
    invoiceService?: InvoiceService;
    invoiceRepo?: InvoiceRepository;
    customerRepo?: CustomerRepository;
  }
}
