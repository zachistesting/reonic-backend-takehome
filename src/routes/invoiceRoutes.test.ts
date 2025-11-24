import fastify, { type FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { InvoiceService } from "../services/InvoiceService";
import { createMockInvoice, validInvoicePayload } from "../test/helpers/testData";
import { errorHandler } from "../utils/errorHandler";
import { NotFoundError } from "../utils/errors";
import { invoicesRoutes } from "./invoiceRoutes";

const validUuid = "01234567-89ab-cdef-0123-456789abcdef";
const notFoundUuid = "00000000-0000-0000-0000-000000000000";

describe("InvoiceRoutes", () => {
  let app: FastifyInstance;
  let mockInvoiceService: InvoiceService;

  beforeEach(async () => {
    mockInvoiceService = {
      getInvoiceById: vi.fn(),
      getInvoiceWithItems: vi.fn(),
      createInvoice: vi.fn(),
      searchInvoicesWithFilters: vi.fn(),
      updateInvoice: vi.fn(),
      deleteInvoice: vi.fn(),
    } as unknown as InvoiceService;

    app = fastify({ logger: false });
    app.decorate("db", {} as unknown as typeof app.db);
    app.decorate("invoiceService", mockInvoiceService);
    app.setErrorHandler(errorHandler);
    await app.register(invoicesRoutes);
  });

  afterEach(async () => {
    await app.close();
  });

  describe("POST /invoices", () => {
    it("should create invoice", async () => {
      const invoice = createMockInvoice();
      vi.mocked(mockInvoiceService.createInvoice).mockResolvedValue(invoice);

      const response = await app.inject({
        method: "POST",
        url: "/invoices",
        payload: validInvoicePayload,
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toMatchObject({
        id: invoice.id,
        externalId: invoice.externalId,
      });
    });

    it("should return 400 for invalid schema", async () => {
      const response = await app.inject({
        method: "POST",
        url: "/invoices",
        payload: { invoiceId: "invalid" },
      });
      expect(response.statusCode).toBe(400);
    });

    it("should handle service errors", async () => {
      vi.mocked(mockInvoiceService.createInvoice).mockRejectedValue(new Error("Service error"));
      const response = await app.inject({
        method: "POST",
        url: "/invoices",
        payload: validInvoicePayload,
      });
      expect([400, 500]).toContain(response.statusCode);
    });
  });

  describe("GET /invoices/:id", () => {
    it("should return invoice when found", async () => {
      const invoice = createMockInvoice();
      vi.mocked(mockInvoiceService.getInvoiceById).mockResolvedValue(invoice);

      const response = await app.inject({
        method: "GET",
        url: `/invoices/${validUuid}`,
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toMatchObject({ id: invoice.id });
    });

    it("should return 404 when not found", async () => {
      vi.mocked(mockInvoiceService.getInvoiceById).mockRejectedValue(
        new NotFoundError(`Invoice ${notFoundUuid} not found`)
      );

      const response = await app.inject({
        method: "GET",
        url: `/invoices/${notFoundUuid}`,
      });
      expect(response.statusCode).toBe(404);
    });

    it("should return invoice with items when includeItems=true", async () => {
      const invoice = createMockInvoice();
      const items = [
        {
          id: "item-1",
          invoiceId: validUuid,
          description: "Test Item",
          quantity: "1",
          unitPrice: "100.00",
          total: "100.00",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      vi.mocked(mockInvoiceService.getInvoiceWithItems).mockResolvedValue({ invoice, items });

      const response = await app.inject({
        method: "GET",
        url: `/invoices/${validUuid}?includeItems=true`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.invoice).toBeDefined();
      expect(body.items).toBeDefined();
    });

    it("should return 400 for invalid UUID format", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/invoices/invalid-id",
      });
      expect(response.statusCode).toBe(400);
    });
  });

  describe("GET /invoices", () => {
    it("should return list of invoices", async () => {
      const mockInvoices = [createMockInvoice()];
      const mockResponse = {
        invoices: mockInvoices,
        pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };
      vi.mocked(mockInvoiceService.searchInvoicesWithFilters).mockResolvedValue(mockResponse);

      const response = await app.inject({
        method: "GET",
        url: "/invoices",
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.invoices).toHaveLength(1);
      expect(body.invoices[0]).toMatchObject({ id: mockInvoices[0].id });
      expect(body.pagination).toBeDefined();
      expect(mockInvoiceService.searchInvoicesWithFilters).toHaveBeenCalledWith("", {
        page: 1,
        limit: 10,
      });
    });

    it("should support query parameters for search", async () => {
      vi.mocked(mockInvoiceService.searchInvoicesWithFilters).mockResolvedValue({
        invoices: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });

      const response = await app.inject({
        method: "GET",
        url: "/invoices?query=test&page=2&limit=20",
      });

      expect(response.statusCode).toBe(200);
      expect(mockInvoiceService.searchInvoicesWithFilters).toHaveBeenCalledWith("test", {
        page: 2,
        limit: 20,
      });
    });
  });

  describe("PUT /invoices/:id", () => {
    it("should update invoice", async () => {
      const invoice = createMockInvoice({ status: "paid", notes: "Updated" });
      vi.mocked(mockInvoiceService.updateInvoice).mockResolvedValue(invoice);

      const response = await app.inject({
        method: "PUT",
        url: `/invoices/${validUuid}`,
        payload: { status: "paid", notes: "Updated" },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe("paid");
      expect(body.notes).toBe("Updated");
    });

    it("should return 404 when not found", async () => {
      vi.mocked(mockInvoiceService.updateInvoice).mockRejectedValue(
        new NotFoundError(`Invoice ${notFoundUuid} not found`)
      );

      const response = await app.inject({
        method: "PUT",
        url: `/invoices/${notFoundUuid}`,
        payload: { status: "paid" },
      });
      expect(response.statusCode).toBe(404);
    });
  });

  describe("DELETE /invoices/:id", () => {
    it("should delete invoice", async () => {
      vi.mocked(mockInvoiceService.deleteInvoice).mockResolvedValue(undefined);

      const response = await app.inject({
        method: "DELETE",
        url: `/invoices/${validUuid}`,
      });

      expect(response.statusCode).toBe(204);
      expect(mockInvoiceService.deleteInvoice).toHaveBeenCalledWith(validUuid);
    });

    it("should return 404 when not found", async () => {
      vi.mocked(mockInvoiceService.deleteInvoice).mockRejectedValue(
        new NotFoundError(`Invoice ${notFoundUuid} not found`)
      );

      const response = await app.inject({
        method: "DELETE",
        url: `/invoices/${notFoundUuid}`,
      });
      expect(response.statusCode).toBe(404);
    });
  });
});
