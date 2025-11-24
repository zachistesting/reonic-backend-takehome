import type { Invoice, NewCustomer, NewInvoiceItem } from "../db/entities";
import type { CustomerRepository } from "../repositories/CustomerRepository";
import type { InvoiceRepository } from "../repositories/InvoiceRepository";

import { NotFoundError } from "../utils/errors";

export type CreateInvoiceData = {
  customer: NewCustomer;
  externalId: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  subtotal: string;
  tax: string;
  total: string;
  status: string;
  items?: Omit<NewInvoiceItem, "invoiceId">[];
};

export class InvoiceService {
  constructor(
    private invoiceRepo: InvoiceRepository,
    private customerRepo: CustomerRepository
  ) {}

  async getInvoiceById(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.getById(id);
    if (!invoice) {
      throw new NotFoundError(`Invoice ${id} not found`);
    }
    return invoice;
  }

  async getInvoiceWithItems(id: string) {
    const invoice = await this.invoiceRepo.getById(id);
    const items = await this.invoiceRepo.getItems(id);
    return { invoice, items };
  }

  async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    const customer = await this.customerRepo.upsert(data.customer);
    const invoiceData = {
      externalId: data.externalId,
      invoiceNumber: data.invoiceNumber,
      customerId: customer.id,
      date: data.date,
      dueDate: data.dueDate,
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      status: data.status,
    };

    return data.items?.length
      ? this.invoiceRepo.saveWithItems(invoiceData, data.items as NewInvoiceItem[])
      : this.invoiceRepo.save(invoiceData);
  }

  async searchInvoicesWithFilters(
    query: string,
    filters?: {
      invoiceDateFrom?: string;
      invoiceDateTo?: string;
      dueDateFrom?: string;
      dueDateTo?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    invoices: Invoice[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    const { invoices, total } = await this.invoiceRepo.searchWithFilters(query, {
      ...filters,
      limit,
      offset,
    });

    return {
      invoices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateInvoice(
    id: string,
    data: Partial<Omit<Invoice, "id" | "createdAt" | "updatedAt">>
  ): Promise<Invoice> {
    const invoice = await this.invoiceRepo.update(id, data);
    if (!invoice) {
      throw new NotFoundError(`Invoice ${id} not found`);
    }
    return invoice;
  }

  async deleteInvoice(id: string): Promise<void> {
    const deleted = await this.invoiceRepo.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Invoice ${id} not found`);
    }
  }
}
