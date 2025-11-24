import type { FastifyPluginAsync } from "fastify";
import invoiceSchema from "../../schema/invoice.schema.json";
import type { Invoice } from "../db/entities";
import { InvoiceRepository } from "../repositories";
import { CustomerRepository } from "../repositories/CustomerRepository";
import { InvoiceService } from "../services";
import type { Invoice as InvoiceSchemaRequest } from "../types/invoiceSchema";
import { ValidationError } from "../utils/errors";
import { transformInvoiceRequest } from "../utils/transformInvoiceRequest";

export const invoicesRoutes: FastifyPluginAsync = async (app) => {
  const invoiceRepo = app.invoiceRepo || new InvoiceRepository(app.db);
  const customerRepo = app.customerRepo || new CustomerRepository(app.db);
  const invoiceService = app.invoiceService || new InvoiceService(invoiceRepo, customerRepo);

  const datePattern = { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" };
  const uuidPattern = "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$";
  const uuidParamsSchema = {
    params: {
      type: "object",
      properties: {
        id: { type: "string", pattern: uuidPattern },
      },
    },
  };

  app.get<{
    Querystring: {
      query?: string;
      invoiceDateFrom?: string;
      invoiceDateTo?: string;
      dueDateFrom?: string;
      dueDateTo?: string;
      page?: number;
      limit?: number;
    };
  }>(
    "/invoices",
    {
      schema: {
        querystring: {
          type: "object",
          properties: {
            query: { type: "string" },
            invoiceDateFrom: datePattern,
            invoiceDateTo: datePattern,
            dueDateFrom: datePattern,
            dueDateTo: datePattern,
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          },
        },
      },
    },
    async (request) => {
      const { query, invoiceDateFrom, invoiceDateTo, dueDateFrom, dueDateTo, page, limit } =
        request.query;

      if (invoiceDateFrom && invoiceDateTo && invoiceDateFrom > invoiceDateTo) {
        throw new ValidationError("invoiceDateFrom must be less than or equal to invoiceDateTo");
      }
      if (dueDateFrom && dueDateTo && dueDateFrom > dueDateTo) {
        throw new ValidationError("dueDateFrom must be less than or equal to dueDateTo");
      }

      return invoiceService.searchInvoicesWithFilters(query || "", {
        invoiceDateFrom,
        invoiceDateTo,
        dueDateFrom,
        dueDateTo,
        page,
        limit,
      });
    }
  );

  app.post<{
    Body: InvoiceSchemaRequest;
  }>(
    "/invoices",
    {
      schema: { body: invoiceSchema },
    },
    async (request) => {
      const invoiceData = transformInvoiceRequest(request.body);
      return invoiceService.createInvoice(invoiceData);
    }
  );

  app.get<{
    Params: { id: string };
    Querystring: { includeItems?: string };
  }>("/invoices/:id", { schema: uuidParamsSchema }, async (request) => {
    const { id } = request.params;
    const { includeItems } = request.query;
    return includeItems === "true"
      ? invoiceService.getInvoiceWithItems(id)
      : invoiceService.getInvoiceById(id);
  });

  app.put<{
    Params: { id: string };
    Body: Partial<Omit<Invoice, "id" | "createdAt" | "updatedAt">>;
  }>("/invoices/:id", { schema: uuidParamsSchema }, async (request) => {
    return invoiceService.updateInvoice(request.params.id, request.body);
  });

  app.delete<{
    Params: { id: string };
  }>("/invoices/:id", { schema: uuidParamsSchema }, async (request, reply) => {
    await invoiceService.deleteInvoice(request.params.id);
    return reply.code(204).send();
  });
};
