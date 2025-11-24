import { relations, sql } from "drizzle-orm";
import {
  char,
  check,
  date,
  decimal,
  index,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { timestamps, uuidv7 } from "../utils";
import { customers } from "./customers";
import { invoiceItems } from "./invoiceItems";

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    externalId: text("external_id").notNull().unique(), // External InvoiceID
    invoiceNumber: text("invoice_number").notNull().unique(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => customers.id),
    date: date("date").notNull(),
    dueDate: date("due_date").notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    tax: decimal("tax", { precision: 10, scale: 2 }).notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    currency: char("currency", { length: 3 }).notNull().default("EUR"),
    status: varchar("status", { length: 20 }).notNull(),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    check(
      "status_check",
      sql`${table.status} IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')`
    ),
    index("invoices_customer_id_idx").on(table.customerId),
    index("invoices_search_idx").on(table.customerId, table.status, table.date),
  ]
);

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  items: many(invoiceItems),
}));

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
