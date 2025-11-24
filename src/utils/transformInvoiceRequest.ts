import type { CreateInvoiceData } from "../services/InvoiceService";
import type { Invoice as InvoiceSchemaRequest } from "../types/invoiceSchema";

export function transformInvoiceRequest(body: InvoiceSchemaRequest): CreateInvoiceData {
  return {
    customer: {
      name: body.customerName,
      email: body.customerEmail,
      addressStreet: body.customerAddress?.street,
      addressCity: body.customerAddress?.city,
      addressPostalCode: body.customerAddress?.postalCode,
      addressCountry: body.customerAddress?.country,
    },
    externalId: body.invoiceId,
    invoiceNumber: body.invoiceNumber,
    date: body.invoiceDate,
    dueDate: body.dueDate,
    subtotal: String(body.subtotal),
    tax: String(body.tax),
    total: String(body.total),
    status: body.status,
    items: body.items?.map((item) => ({
      description: item.description,
      quantity: String(item.quantity),
      unitPrice: String(item.unitPrice),
      total: String(item.total),
    })),
  };
}
