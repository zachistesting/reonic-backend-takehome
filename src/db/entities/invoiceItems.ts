import { relations, sql } from "drizzle-orm";
import { check, decimal, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps, uuidv7 } from "../utils";
import { invoices } from "./invoices";

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    invoiceId: uuid("invoice_id")
      .notNull()
      .references(() => invoices.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    ...timestamps,
  },
  (table) => [
    check("total_check", sql`${table.total} = ROUND(${table.quantity} * ${table.unitPrice}, 2)`),
  ]
);

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;
