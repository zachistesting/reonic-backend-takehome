import { beforeEach, describe, expect, it } from "vitest";
import { customers, invoiceItems, invoices, type NewInvoiceItem } from "../db/entities";
import { getTestDb, setupDatabaseHooks } from "../test/helpers/db";
import { createInvoiceData } from "../test/helpers/testData";
import { CustomerRepository } from "./CustomerRepository";
import { InvoiceRepository } from "./InvoiceRepository";

describe("InvoiceRepository", () => {
  setupDatabaseHooks();

  let repo: InvoiceRepository;
  let customerRepo: CustomerRepository;
  let testCustomerId: string;

  beforeEach(async () => {
    const db = getTestDb();
    await db.delete(invoiceItems);
    await db.delete(invoices);
    await db.delete(customers);

    repo = new InvoiceRepository(db);
    customerRepo = new CustomerRepository(db);

    const customer = await customerRepo.save({
      name: "Test Customer",
      email: "test@example.com",
    });
    testCustomerId = customer.id;
  });

  describe("save", () => {
    it("should save invoice", async () => {
      const result = await repo.save({
        ...createInvoiceData(),
        customerId: testCustomerId,
      });
      expect(result.id).toBeDefined();
      expect(result.externalId).toBe("INV-001");
      expect(result.customerId).toBe(testCustomerId);
    });
  });

  describe("saveItem", () => {
    it("should save invoice item", async () => {
      const invoice = await repo.save({
        ...createInvoiceData({ externalId: "INV-002" }),
        customerId: testCustomerId,
      });

      const result = await repo.saveItem({
        invoiceId: invoice.id,
        description: "Test Item",
        quantity: "2.00",
        unitPrice: "50.00",
        total: "100.00",
      });

      expect(result.id).toBeDefined();
      expect(result.invoiceId).toBe(invoice.id);
      expect(result.description).toBe("Test Item");
    });
  });

  describe("saveWithItems", () => {
    it("should save invoice with items", async () => {
      const invoiceData = {
        ...createInvoiceData({ externalId: "INV-003" }),
        customerId: testCustomerId,
      };
      const items = [
        { description: "Item 1", quantity: "1.00", unitPrice: "100.00", total: "100.00" },
        { description: "Item 2", quantity: "1.00", unitPrice: "50.00", total: "50.00" },
      ] as NewInvoiceItem[];

      const invoice = await repo.saveWithItems(invoiceData, items);
      const savedItems = await repo.getItems(invoice.id);

      expect(savedItems).toHaveLength(2);
      expect(savedItems[0].description).toBe("Item 1");
    });
  });

  describe("getById", () => {
    it("should find invoice by id", async () => {
      const saved = await repo.save({
        ...createInvoiceData({ externalId: "INV-005" }),
        customerId: testCustomerId,
      });
      const result = await repo.getById(saved.id);
      expect(result).toEqual(saved);
    });

    it("should return null when not found", async () => {
      const result = await repo.getById("00000000-0000-0000-0000-000000000000");
      expect(result).toBeNull();
    });
  });

  describe("getByExternalId", () => {
    it("should find invoice by external id", async () => {
      const saved = await repo.save({
        ...createInvoiceData({ externalId: "INV-006" }),
        customerId: testCustomerId,
      });
      const result = await repo.getByExternalId("INV-006");
      expect(result).toEqual(saved);
    });
  });

  describe("getItems", () => {
    it("should get items for invoice", async () => {
      const invoice = await repo.save({
        ...createInvoiceData({ externalId: "INV-007" }),
        customerId: testCustomerId,
      });

      await repo.saveItem({
        invoiceId: invoice.id,
        description: "Item A",
        quantity: "2.00",
        unitPrice: "50.00",
        total: "100.00",
      });
      await repo.saveItem({
        invoiceId: invoice.id,
        description: "Item B",
        quantity: "2.00",
        unitPrice: "50.00",
        total: "100.00",
      });

      const result = await repo.getItems(invoice.id);
      expect(result).toHaveLength(2);
      expect(result[0].description).toBe("Item A");
    });
  });

  describe("search", () => {
    it("should search by invoice number", async () => {
      await repo.save({
        ...createInvoiceData({ externalId: "INV-016", invoiceNumber: "2024-0016" }),
        customerId: testCustomerId,
      });
      const result = await repo.search("2024-0016");
      expect(result).toHaveLength(1);
      expect(result[0].invoiceNumber).toBe("2024-0016");
    });

    it("should search by external id", async () => {
      await repo.save({
        ...createInvoiceData({ externalId: "INV-017" }),
        customerId: testCustomerId,
      });
      const result = await repo.search("INV-017");
      expect(result).toHaveLength(1);
      expect(result[0].externalId).toBe("INV-017");
    });

    it("should search by customer name", async () => {
      const customer = await customerRepo.save({
        name: "Alice",
        email: "alice@example.com",
      });
      await repo.save({
        ...createInvoiceData({ externalId: "INV-018" }),
        customerId: customer.id,
      });
      const result = await repo.search("Alice");
      expect(result).toHaveLength(1);
    });

    it("should search by customer email", async () => {
      const customer = await customerRepo.save({
        name: "Bob",
        email: "bob@example.com",
      });
      await repo.save({
        ...createInvoiceData({ externalId: "INV-019" }),
        customerId: customer.id,
      });
      const result = await repo.search("bob@example.com");
      expect(result).toHaveLength(1);
    });
  });

  describe("searchWithFilters", () => {
    it("should return paginated results", async () => {
      await repo.save({
        ...createInvoiceData({ externalId: "INV-020", invoiceNumber: "2024-0020" }),
        customerId: testCustomerId,
      });
      await repo.save({
        ...createInvoiceData({ externalId: "INV-021", invoiceNumber: "2024-0021" }),
        customerId: testCustomerId,
      });

      const result = await repo.searchWithFilters("", { limit: 1, offset: 0 });
      expect(result.invoices).toHaveLength(1);
      expect(result.total).toBe(2);
    });
  });
});
