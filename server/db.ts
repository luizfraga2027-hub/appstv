import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, resellers, creditTransactions, activationCodes, subscriptions, devices } from "../drizzle/schema";
import type { User, Reseller, CreditTransaction, ActivationCode, Subscription, Device } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ===== USER QUERIES =====

export async function createUser(user: InsertUser): Promise<User> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(users).values(user);
  const newUser = await db.select().from(users).where(eq(users.id, result[0].insertId as number)).limit(1);
  return newUser[0]!;
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(users);
}

export async function updateUserStatus(userId: number, status: "active" | "inactive" | "blocked"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set({ status }).where(eq(users.id, userId));
}

// ===== RESELLER QUERIES =====

export async function createReseller(reseller: any): Promise<Reseller> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(resellers).values(reseller);
  const newReseller = await db.select().from(resellers).where(eq(resellers.userId, reseller.userId)).limit(1);
  return newReseller[0]!;
}

export async function getResellerByUserId(userId: number): Promise<Reseller | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(resellers).where(eq(resellers.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getResellerById(id: number): Promise<Reseller | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(resellers).where(eq(resellers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllResellers(): Promise<Reseller[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(resellers);
}

export async function updateResellerCredits(resellerId: number, amount: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const reseller = await getResellerById(resellerId);
  if (!reseller) throw new Error("Reseller not found");

  const newBalance = parseFloat(reseller.creditBalance.toString()) + amount;
  await db.update(resellers).set({ creditBalance: newBalance.toString() }).where(eq(resellers.id, resellerId));
}

// ===== CREDIT TRANSACTION QUERIES =====

export async function createCreditTransaction(transaction: Omit<CreditTransaction, 'id' | 'createdAt'>): Promise<CreditTransaction> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(creditTransactions).values(transaction);
  const newTransaction = await db.select().from(creditTransactions).where(eq(creditTransactions.resellerId, transaction.resellerId)).orderBy(creditTransactions.createdAt).limit(1);
  return newTransaction[0]!;
}

export async function getCreditTransactionsByResellerId(resellerId: number): Promise<CreditTransaction[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(creditTransactions).where(eq(creditTransactions.resellerId, resellerId));
}

// ===== ACTIVATION CODE QUERIES =====

export async function createActivationCode(code: Omit<ActivationCode, 'id' | 'createdAt'>): Promise<ActivationCode> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(activationCodes).values(code);
  const newCode = await db.select().from(activationCodes).where(eq(activationCodes.code, code.code)).limit(1);
  return newCode[0]!;
}

export async function getActivationCodeByCode(code: string): Promise<ActivationCode | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(activationCodes).where(eq(activationCodes.code, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getActivationCodesByResellerId(resellerId: number): Promise<ActivationCode[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(activationCodes).where(eq(activationCodes.resellerId, resellerId));
}

export async function updateActivationCodeStatus(codeId: number, status: "available" | "activated" | "expired", customerId?: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updates: any = { status };
  if (customerId !== undefined) {
    updates.customerId = customerId;
    updates.activatedAt = new Date();
  }

  await db.update(activationCodes).set(updates).where(eq(activationCodes.id, codeId));
}

// ===== SUBSCRIPTION QUERIES =====

export async function createSubscription(subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(subscriptions).values(subscription);
  const newSubscription = await db.select().from(subscriptions).where(eq(subscriptions.customerId, subscription.customerId)).limit(1);
  return newSubscription[0]!;
}

export async function getSubscriptionsByCustomerId(customerId: number): Promise<Subscription[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(subscriptions).where(eq(subscriptions.customerId, customerId));
}

export async function getActiveSubscriptionByCustomerId(customerId: number): Promise<Subscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(subscriptions).where(
    and(eq(subscriptions.customerId, customerId), eq(subscriptions.status, "active"))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===== DEVICE QUERIES =====

export async function createDevice(device: Omit<Device, 'id' | 'createdAt'>): Promise<Device> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(devices).values(device);
  const newDevice = await db.select().from(devices).where(eq(devices.deviceId, device.deviceId)).limit(1);
  return newDevice[0]!;
}

export async function getDevicesBySubscriptionId(subscriptionId: number): Promise<Device[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(devices).where(eq(devices.subscriptionId, subscriptionId));
}


// ===== CUSTOMER QUERIES =====

export async function createCustomer(customerId: number, resellerId: number, iptvListUrl?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { customers } = await import("../drizzle/schema");
  const result = await db.insert(customers).values({
    userId: customerId,
    resellerId,
    iptvListUrl,
  });
  return result;
}

export async function getCustomerByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const { customers } = await import("../drizzle/schema");
  const result = await db.select().from(customers).where(eq(customers.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCustomersByResellerId(resellerId: number) {
  const db = await getDb();
  if (!db) return [];

  const { customers } = await import("../drizzle/schema");
  return db.select().from(customers).where(eq(customers.resellerId, resellerId));
}

export async function updateCustomerIptvList(userId: number, iptvListUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { customers } = await import("../drizzle/schema");
  return db.update(customers).set({ iptvListUrl }).where(eq(customers.userId, userId));
}

export async function updateResellerIptvList(resellerId: number, iptvListUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(resellers).set({ iptvListUrl }).where(eq(resellers.id, resellerId));
}

export async function updateResellerCodePrice(resellerId: number, codePrice: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(resellers).set({ codePrice }).where(eq(resellers.id, resellerId));
}

export async function getResellerByIdWithPrice(resellerId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(resellers).where(eq(resellers.id, resellerId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}


export async function getSubscriptionByCodeId(codeId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(subscriptions).where(eq(subscriptions.activationCodeId, codeId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
