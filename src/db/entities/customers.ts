import { relations } from "drizzle-orm";
import { index, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps, uuidv7 } from "../utils";
import { invoices } from "./invoices";

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().default(uuidv7),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    addressStreet: text("address_street"),
    addressCity: text("address_city"),
    addressPostalCode: text("address_postal_code"),
    addressCountry: text("address_country"),
    ...timestamps,
  },
  (table) => [
    index("customers_name_idx").on(table.name),
    index("customers_name_gin_idx").using("gin", table.name.op("gin_trgm_ops")), // For fuzzy search
  ]
);

export const customersRelations = relations(customers, ({ many }) => ({
  invoices: many(invoices),
}));

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
