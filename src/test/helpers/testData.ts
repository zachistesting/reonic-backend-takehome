import type { Customer, Invoice, NewCustomer, NewInvoice } from "../../db/entities";

export const createMockInvoice = (overrides?: Partial<Invoice>): Invoice => ({
  id: "123",
  externalId: "INV-001",
  invoiceNumber: "2024-0001",
  customerId: "cust-1",
  date: "2024-01-15",
  dueDate: "2024-02-14",
  subtotal: "100.00",
  tax: "20.00",
  total: "120.00",
  currency: "EUR",
  status: "draft",
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createMockCustomer = (overrides?: Partial<Customer>): Customer => ({
  id: "cust-1",
  name: "John Doe",
  email: "john@example.com",
  addressStreet: null,
  addressCity: null,
  addressPostalCode: null,
  addressCountry: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createCustomerData = (overrides?: Partial<NewCustomer>): NewCustomer => ({
  name: "John Doe",
  email: "john@example.com",
  ...overrides,
});

export const createInvoiceData = (
  overrides?: Partial<Omit<NewInvoice, "customerId">>
): Omit<NewInvoice, "customerId"> => ({
  externalId: "INV-001",
  invoiceNumber: "2024-0001",
  date: "2024-01-15",
  dueDate: "2024-02-15",
  subtotal: "100.00",
  tax: "20.00",
  total: "120.00",
  status: "draft",
  ...overrides,
});

export const validInvoicePayload = {
  invoiceId: "INV-A1B2C3D4-1234-5678-9ABC-DEF012345678",
  invoiceNumber: "2024-0001",
  customerName: "Test Customer",
  customerEmail: "test@example.com",
  invoiceDate: "2024-01-15",
  dueDate: "2024-02-14",
  items: [{ description: "Test Item", quantity: 1, unitPrice: 100, total: 100 }],
  subtotal: 100,
  tax: 20,
  total: 120,
  status: "draft",
} as const;
