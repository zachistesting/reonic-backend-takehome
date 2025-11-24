import { sql } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

export const uuidv7 = sql`uuidv7()`;

export const timestamps = {
  createdAt: timestamp("created_at", {
    mode: "date",
    precision: 3,
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    precision: 3,
    withTimezone: true,
  })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
};
