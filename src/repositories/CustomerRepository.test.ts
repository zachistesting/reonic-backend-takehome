import { beforeEach, describe, expect, it } from "vitest";
import { customers } from "../db/entities";
import { getTestDb, setupDatabaseHooks } from "../test/helpers/db";
import { createCustomerData } from "../test/helpers/testData";
import { CustomerRepository } from "./CustomerRepository";

describe("CustomerRepository", () => {
  setupDatabaseHooks();

  let repo: CustomerRepository;

  beforeEach(async () => {
    const db = getTestDb();
    await db.delete(customers);
    repo = new CustomerRepository(db);
  });

  describe("save", () => {
    it("should save customer", async () => {
      const result = await repo.save(createCustomerData());
      expect(result.id).toBeDefined();
      expect(result.name).toBe("John Doe");
      expect(result.email).toBe("john@example.com");
    });
  });

  describe("getById", () => {
    it("should find customer by id", async () => {
      const saved = await repo.save(
        createCustomerData({ name: "Jane", email: "jane@example.com" })
      );
      const result = await repo.getById(saved.id);
      expect(result).toEqual(saved);
    });

    it("should return null when not found", async () => {
      const result = await repo.getById("00000000-0000-0000-0000-000000000000");
      expect(result).toBeNull();
    });
  });

  describe("getByEmail", () => {
    it("should find customer by email", async () => {
      const saved = await repo.save(createCustomerData({ email: "bob@example.com" }));
      const result = await repo.getByEmail("bob@example.com");
      expect(result).toEqual(saved);
    });
  });

  describe("upsert", () => {
    it("should create new customer", async () => {
      const result = await repo.upsert(createCustomerData({ email: "alice@example.com" }));
      expect(result.id).toBeDefined();
    });

    it("should update existing customer", async () => {
      await repo.save(createCustomerData({ name: "Old Name", email: "test@example.com" }));
      const result = await repo.upsert(
        createCustomerData({ name: "New Name", email: "test@example.com" })
      );
      expect(result.name).toBe("New Name");
    });
  });
});
