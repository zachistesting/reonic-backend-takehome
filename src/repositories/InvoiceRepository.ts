import { and, between, eq, getTableColumns, gte, ilike, lte, or, sql } from "drizzle-orm";
import type { DrizzleClient } from "../db";
import {
  customers,
  type Invoice,
  type InvoiceItem,
  invoiceItems,
  invoices,
  type NewInvoice,
  type NewInvoiceItem,
} from "../db/entities";

export class InvoiceRepository {
  constructor(private db: DrizzleClient) {}

  async save(data: NewInvoice): Promise<Invoice> {
    const [invoice] = await this.db.insert(invoices).values(data).returning();
    return invoice;
  }

  async saveItem(data: NewInvoiceItem): Promise<InvoiceItem> {
    const [item] = await this.db.insert(invoiceItems).values(data).returning();
    return item;
  }

  async saveWithItems(invoiceData: NewInvoice, items: NewInvoiceItem[]): Promise<Invoice> {
    return this.db.transaction(async (tx) => {
      const [invoice] = await tx.insert(invoices).values(invoiceData).returning();

      if (items.length > 0) {
        const itemsWithInvoiceId = items.map((item) => ({
          ...item,
          invoiceId: invoice.id,
        }));
        await tx.insert(invoiceItems).values(itemsWithInvoiceId);
      }

      return invoice;
    });
  }

  async getById(id: string): Promise<Invoice | null> {
    const [invoice] = await this.db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || null;
  }

  async getByExternalId(externalId: string): Promise<Invoice | null> {
    const [invoice] = await this.db
      .select()
      .from(invoices)
      .where(eq(invoices.externalId, externalId));
    return invoice || null;
  }

  async getItems(invoiceId: string): Promise<InvoiceItem[]> {
    return this.db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async search(query: string): Promise<Invoice[]> {
    return this.db
      .select(getTableColumns(invoices))
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(
        or(
          ilike(invoices.invoiceNumber, `%${query}%`),
          ilike(invoices.externalId, `%${query}%`),
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`)
        )
      );
  }

  async searchWithFilters(
    query: string,
    options?: {
      invoiceDateFrom?: string;
      invoiceDateTo?: string;
      dueDateFrom?: string;
      dueDateTo?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<{ invoices: Invoice[]; total: number }> {
    const conditions = [];

    if (query) {
      conditions.push(
        or(
          ilike(invoices.invoiceNumber, `%${query}%`),
          ilike(invoices.externalId, `%${query}%`),
          ilike(customers.name, `%${query}%`),
          ilike(customers.email, `%${query}%`)
        )
      );
    }

    if (options?.invoiceDateFrom || options?.invoiceDateTo) {
      if (options.invoiceDateFrom && options.invoiceDateTo) {
        conditions.push(between(invoices.date, options.invoiceDateFrom, options.invoiceDateTo));
      } else if (options.invoiceDateFrom) {
        conditions.push(gte(invoices.date, options.invoiceDateFrom));
      } else if (options.invoiceDateTo) {
        conditions.push(lte(invoices.date, options.invoiceDateTo));
      }
    }

    if (options?.dueDateFrom || options?.dueDateTo) {
      if (options.dueDateFrom && options.dueDateTo) {
        conditions.push(between(invoices.dueDate, options.dueDateFrom, options.dueDateTo));
      } else if (options.dueDateFrom) {
        conditions.push(gte(invoices.dueDate, options.dueDateFrom));
      } else if (options.dueDateTo) {
        conditions.push(lte(invoices.dueDate, options.dueDateTo));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const dataQuery = this.db
      .select(getTableColumns(invoices))
      .from(invoices)
      .innerJoin(customers, eq(invoices.customerId, customers.id))
      .where(whereClause);

    if (options?.limit) {
      dataQuery.limit(options.limit);
    }

    if (options?.offset) {
      dataQuery.offset(options.offset);
    }

    const [invoicesResult, countResult] = await Promise.all([
      dataQuery,
      this.db
        .select({ count: sql<number>`count(*)` })
        .from(invoices)
        .innerJoin(customers, eq(invoices.customerId, customers.id))
        .where(whereClause),
    ]);

    return {
      invoices: invoicesResult,
      total: Number(countResult[0].count),
    };
  }

  async update(
    id: string,
    data: Partial<Omit<Invoice, "id" | "createdAt">>
  ): Promise<Invoice | null> {
    const [invoice] = await this.db
      .update(invoices)
      .set({ ...data })
      .where(eq(invoices.id, id))
      .returning();
    return invoice;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.delete(invoices).where(eq(invoices.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}
