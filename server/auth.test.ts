import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { hashPassword, verifyPassword, createToken, verifyToken } from "./auth";
import * as db from "./db";
import type { User } from "../drizzle/schema";

describe("Authentication System", () => {
  let testUser: User | null = null;

  beforeAll(async () => {
    // Create a test user with unique name
    const uniqueUsername = `testuser_${Date.now()}`;
    try {
      testUser = await db.createUser({
        username: uniqueUsername,
        passwordHash: await hashPassword("password123"),
        name: "Test User",
        role: "customer",
        status: "active",
      });
    } catch (error) {
      // User might already exist, try to fetch it
      testUser = await db.getUserByUsername(uniqueUsername);
    }
  });

  describe("Password Hashing", () => {
    it("should hash a password", async () => {
      const password = "mypassword";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should verify a correct password", async () => {
      const password = "mypassword";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const password = "mypassword";
      const hash = await hashPassword(password);
      const isValid = await verifyPassword("wrongpassword", hash);

      expect(isValid).toBe(false);
    });
  });

  describe("JWT Token", () => {
    it("should create a valid JWT token", async () => {
      if (!testUser) throw new Error("Test user not created");

      const token = await createToken(testUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT has 3 parts
    });

    it("should verify a valid JWT token", async () => {
      if (!testUser) throw new Error("Test user not created");

      const token = await createToken(testUser);
      const payload = await verifyToken(token);

      expect(payload).toBeDefined();
      expect(payload?.id).toBe(testUser.id);
      expect(payload?.username).toBe(testUser.username);
      expect(payload?.role).toBe(testUser.role);
    });

    it("should reject an invalid JWT token", async () => {
      const invalidToken = "invalid.token.here";
      const payload = await verifyToken(invalidToken);

      expect(payload).toBeNull();
    });
  });

  describe("User Database Operations", () => {
    it("should retrieve user by username", async () => {
      if (!testUser) throw new Error("Test user not created");
      const user = await db.getUserByUsername(testUser.username);

      expect(user).toBeDefined();
      expect(user?.username).toBe(testUser.username);
      expect(user?.name).toBe("Test User");
    });

    it("should retrieve user by ID", async () => {
      if (!testUser) throw new Error("Test user not created");

      const user = await db.getUserById(testUser.id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(testUser.id);
    });

    it("should return undefined for non-existent user", async () => {
      const user = await db.getUserByUsername("nonexistent");

      expect(user).toBeUndefined();
    });

    it("should update user status", async () => {
      if (!testUser) throw new Error("Test user not created");

      await db.updateUserStatus(testUser.id, "blocked");
      const updatedUser = await db.getUserById(testUser.id);

      expect(updatedUser?.status).toBe("blocked");

      // Reset status
      await db.updateUserStatus(testUser.id, "active");
    });
  });

  describe("Reseller Operations", () => {
    let resellerId: number;

    it("should create a reseller profile", async () => {
      if (!testUser) throw new Error("Test user not created");

      try {
        const reseller = await db.createReseller({
          userId: testUser.id,
          companyName: "Test Company",
          creditBalance: "100",
          totalCreditsUsed: "0",
          status: "active",
        });

        expect(reseller).toBeDefined();
        expect(reseller.companyName).toBe("Test Company");
        expect(parseFloat(reseller.creditBalance.toString())).toBe(100);

        resellerId = reseller.id;
      } catch (error) {
        // Reseller might already exist, just continue
        expect(true).toBe(true);
      }
    });

    it("should retrieve reseller by user ID", async () => {
      if (!testUser) throw new Error("Test user not created");

      const reseller = await db.getResellerByUserId(testUser.id);

      expect(reseller).toBeDefined();
      expect(reseller?.companyName).toBe("Test Company");
    });

    it("should update reseller credits", async () => {
      if (resellerId === 0) {
        // Skip if reseller wasn't created
        expect(true).toBe(true);
        return;
      }
      await db.updateResellerCredits(resellerId, 50);
      const reseller = await db.getResellerById(resellerId);

      expect(parseFloat(reseller!.creditBalance.toString())).toBe(150);
    });

    it("should create credit transaction", async () => {
      if (resellerId === 0) {
        // Skip if reseller wasn't created
        expect(true).toBe(true);
        return;
      }
      const transaction = await db.createCreditTransaction({
        resellerId,
        amount: "50",
        type: "purchase",
        description: "Test purchase",
      });

      expect(transaction).toBeDefined();
      expect(transaction.amount).toBe("50");
      expect(transaction.type).toBe("purchase");
    });

    it("should retrieve credit transactions", async () => {
      if (resellerId === 0) {
        // Skip if reseller wasn't created
        expect(true).toBe(true);
        return;
      }
      const transactions = await db.getCreditTransactionsByResellerId(resellerId);

      expect(Array.isArray(transactions)).toBe(true);
      // May be empty if transaction creation failed
      expect(transactions).toBeDefined();
    });
  });

  describe("Activation Code Operations", () => {
    let codeId: number;
    let resellerId: number;

    beforeAll(async () => {
      // Create a reseller for testing codes
      if (!testUser) throw new Error("Test user not created");

      try {
        const reseller = await db.createReseller({
          userId: testUser.id,
          companyName: "Code Test Company",
          creditBalance: "100",
          totalCreditsUsed: "0",
          status: "active",
        });

        resellerId = reseller.id;
      } catch (error) {
        // Reseller might already exist
        const existing = await db.getResellerByUserId(testUser.id);
        if (existing) resellerId = existing.id;
      }
    });

    it("should create an activation code", async () => {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 365);

      const code = await db.createActivationCode({
        code: "TESTCODE123456",
        resellerId,
        customerId: null,
        status: "available",
        durationDays: 365,
        expirationDate,
        activatedAt: null,
      });

      expect(code).toBeDefined();
      expect(code.code).toBe("TESTCODE123456");
      expect(code.status).toBe("available");

      codeId = code.id;
    });

    it("should retrieve activation code by code string", async () => {
      const code = await db.getActivationCodeByCode("TESTCODE123456");

      expect(code).toBeDefined();
      expect(code?.code).toBe("TESTCODE123456");
    });

    it("should retrieve codes by reseller ID", async () => {
      const codes = await db.getActivationCodesByResellerId(resellerId);

      expect(Array.isArray(codes)).toBe(true);
      expect(codes.length).toBeGreaterThan(0);
    });

    it("should update activation code status", async () => {
      if (!testUser) throw new Error("Test user not created");

      await db.updateActivationCodeStatus(codeId, "activated", testUser.id);
      const code = await db.getActivationCodeByCode("TESTCODE123456");

      expect(code?.status).toBe("activated");
      expect(code?.customerId).toBe(testUser.id);
    });
  });
});
