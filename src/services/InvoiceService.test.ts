import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CustomerRepository } from "../repositories/CustomerRepository";
import type { InvoiceRepository } from "../repositories/InvoiceRepository";
import { createMockCustomer, createMockInvoice } from "../test/helpers/testData";
import { InvoiceService } from "./InvoiceService";

describe("InvoiceService", () => {
  let service: InvoiceService;
  let mockInvoiceRepo: InvoiceRepository;
  let mockCustomerRepo: CustomerRepository;

  beforeEach(() => {
    mockInvoiceRepo = {
      getById: vi.fn(),
      getItems: vi.fn(),
      save: vi.fn(),
      saveWithItems: vi.fn(),
      search: vi.fn(),
      searchWithFilters: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as InvoiceRepository;

    mockCustomerRepo = {
      upsert: vi.fn(),
    } as unknown as CustomerRepository;

    service = new InvoiceService(mockInvoiceRepo, mockCustomerRepo);
  });

  describe("getInvoiceById", () => {
    it("should return invoice when found", async () => {
      const invoice = createMockInvoice();
      vi.mocked(mockInvoiceRepo.getById).mockResolvedValue(invoice);
      const result = await service.getInvoiceById("123");
      expect(result).toEqual(invoice);
    });

    it("should throw NotFoundError when not found", async () => {
      vi.mocked(mockInvoiceRepo.getById).mockResolvedValue(null);
      await expect(service.getInvoiceById("999")).rejects.toThrow("Invoice 999 not found");
    });
  });

  describe("getInvoiceWithItems", () => {
    it("should return invoice with items", async () => {
      const invoice = createMockInvoice();
      const items = [
        {
          id: "item-1",
          invoiceId: "123",
          description: "Product A",
          quantity: "2.00",
          unitPrice: "50.00",
          total: "100.00",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      vi.mocked(mockInvoiceRepo.getById).mockResolvedValue(invoice);
      vi.mocked(mockInvoiceRepo.getItems).mockResolvedValue(items);

      const result = await service.getInvoiceWithItems("123");
      expect(result).toEqual({ invoice, items });
    });
  });

  describe("createInvoice", () => {
    it("should create invoice without items", async () => {
      const data = {
        externalId: "INV-001",
        invoiceNumber: "2024-001",
        date: "2024-01-01",
        dueDate: "2024-01-31",
        subtotal: "100.00",
        tax: "20.00",
        total: "120.00",
        status: "draft",
        customer: { name: "John", email: "john@example.com" },
      };
      const customer = createMockCustomer();
      const invoice = createMockInvoice();

      vi.mocked(mockCustomerRepo.upsert).mockResolvedValue(customer);
      vi.mocked(mockInvoiceRepo.save).mockResolvedValue(invoice);

      const result = await service.createInvoice(data);
      expect(result).toEqual(invoice);
      expect(mockCustomerRepo.upsert).toHaveBeenCalledWith(data.customer);
    });

    it("should create invoice with items", async () => {
      const data = {
        externalId: "INV-002",
        invoiceNumber: "2024-002",
        date: "2024-01-02",
        dueDate: "2024-02-01",
        subtotal: "200.00",
        tax: "40.00",
        total: "240.00",
        status: "draft",
        customer: { name: "Jane", email: "jane@example.com" },
        items: [{ description: "Product", quantity: "4.00", unitPrice: "50.00", total: "200.00" }],
      };
      const customer = createMockCustomer();
      const invoice = createMockInvoice();

      vi.mocked(mockCustomerRepo.upsert).mockResolvedValue(customer);
      vi.mocked(mockInvoiceRepo.saveWithItems).mockResolvedValue(invoice);

      const result = await service.createInvoice(data);
      expect(result).toEqual(invoice);
    });
  });

  describe("searchInvoicesWithFilters", () => {
    it("should return filtered results with pagination", async () => {
      const invoices = [createMockInvoice()];
      vi.mocked(mockInvoiceRepo.searchWithFilters).mockResolvedValue({
        invoices,
        total: 1,
      });

      const result = await service.searchInvoicesWithFilters("test", {
        invoiceDateFrom: "2024-01-01",
        invoiceDateTo: "2024-01-31",
        page: 1,
        limit: 10,
      });

      expect(result.invoices).toEqual(invoices);
      expect(result.pagination.total).toBe(1);
      expect(result.pagination.page).toBe(1);
    });
  });

  describe("updateInvoice", () => {
    it("should update invoice", async () => {
      const invoice = createMockInvoice({ status: "paid" });
      vi.mocked(mockInvoiceRepo.update).mockResolvedValue(invoice);
      const result = await service.updateInvoice("123", { status: "paid" });
      expect(result).toEqual(invoice);
    });

    it("should throw NotFoundError when not found", async () => {
      vi.mocked(mockInvoiceRepo.update).mockResolvedValue(null);
      await expect(service.updateInvoice("999", { status: "paid" })).rejects.toThrow(
        "Invoice 999 not found"
      );
    });
  });

  describe("deleteInvoice", () => {
    it("should delete invoice", async () => {
      vi.mocked(mockInvoiceRepo.delete).mockResolvedValue(true);
      await service.deleteInvoice("123");
      expect(mockInvoiceRepo.delete).toHaveBeenCalledWith("123");
    });

    it("should throw NotFoundError when not found", async () => {
      vi.mocked(mockInvoiceRepo.delete).mockResolvedValue(false);
      await expect(service.deleteInvoice("999")).rejects.toThrow("Invoice 999 not found");
    });
  });
});
