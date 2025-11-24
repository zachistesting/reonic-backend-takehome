import { eq } from "drizzle-orm";
import type { DrizzleClient } from "../db";
import { type Customer, customers, type NewCustomer } from "../db/entities";

export class CustomerRepository {
  constructor(private db: DrizzleClient) {}

  async save(data: NewCustomer): Promise<Customer> {
    const [customer] = await this.db.insert(customers).values(data).returning();
    return customer;
  }

  async upsert(data: NewCustomer): Promise<Customer> {
    const [customer] = await this.db
      .insert(customers)
      .values(data)
      .onConflictDoUpdate({
        target: customers.email,
        set: {
          name: data.name,
          addressStreet: data.addressStreet,
          addressCity: data.addressCity,
          addressPostalCode: data.addressPostalCode,
          addressCountry: data.addressCountry,
        },
      })
      .returning();
    return customer;
  }

  async getById(id: string): Promise<Customer | null> {
    const [customer] = await this.db.select().from(customers).where(eq(customers.id, id));
    return customer || null;
  }

  async getByEmail(email: string): Promise<Customer | null> {
    const [customer] = await this.db.select().from(customers).where(eq(customers.email, email));
    return customer || null;
  }
}
