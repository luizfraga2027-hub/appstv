import { eq, desc, gte, lte, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { cache, getOrSet } from "./cache";
import { InsertUser, users, resellers, creditTransactions, activationCodes, subscriptions, devices, applications, macActivations, accessLogs, customers, plans, resellerPlans, appCodes } from "../drizzle/schema";
import type { User, Reseller, CreditTransaction, ActivationCode, Subscription, Device, Application, InsertApplication, MacActivation, InsertMacActivation, AccessLog, InsertAccessLog, Customer, Plan, InsertPlan, ResellerPlan, InsertResellerPlan, AppCode, InsertAppCode } from "../drizzle/schema";

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
  return getOrSet(`reseller:${id}`, async () => {
    const db = await getDb();
    if (!db) return undefined;

    const result = await db.select().from(resellers).where(eq(resellers.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }, 600); // 10 minutes cache
}

export async function getAllResellers(): Promise<Reseller[]> {
  return getOrSet('resellers:all', async () => {
    const db = await getDb();
    if (!db) return [];

    return db.select().from(resellers);
  }, 600); // 10 minutes cache
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


// ===== APPLICATIONS =====

export async function createApplication(data: InsertApplication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(applications).values(data);
  return result;
}

export async function getAllApplications() {
  return getOrSet('applications:all', async () => {
    const db = await getDb();
    if (!db) return [];

    return db.select().from(applications);
  }, 600); // 10 minutes cache
}

export async function getApplicationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  return result[0];
}

export async function updateApplication(id: number, data: Partial<Application>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(applications).set(data).where(eq(applications.id, id));
}

export async function deleteApplication(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(applications).where(eq(applications.id, id));
}

// ===== MAC ACTIVATIONS =====

export async function createMacActivation(data: InsertMacActivation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(macActivations).values(data);
  return result;
}

export async function getMacActivationByMacId(macId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(macActivations).where(eq(macActivations.macId, macId)).limit(1);
  return result[0];
}

export async function getMacActivationsByResellerId(resellerId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(macActivations).where(eq(macActivations.resellerId, resellerId));
}

export async function updateMacActivation(id: number, data: Partial<MacActivation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(macActivations).set(data).where(eq(macActivations.id, id));
}

export async function updateMacActivationIptvList(macId: string, iptvListUrl: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(macActivations).set({ iptvListUrl }).where(eq(macActivations.macId, macId));
}

export async function deleteMacActivation(macId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(macActivations).where(eq(macActivations.macId, macId));
}

// ===== ACCESS LOGS =====

export async function createAccessLog(data: InsertAccessLog): Promise<AccessLog> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(accessLogs).values(data);
  const result = await db.select().from(accessLogs).orderBy(desc(accessLogs.createdAt)).limit(1);
  return result[0]!;
}

export async function getAccessLogsByMacId(macId: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(accessLogs).where(eq(accessLogs.macId, macId)).orderBy(desc(accessLogs.createdAt));
}

export async function getAccessLogsByApplicationId(applicationId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(accessLogs).where(eq(accessLogs.applicationId, applicationId)).orderBy(desc(accessLogs.createdAt)).limit(limit);
}

export async function getAccessLogsByDateRange(startDate: Date, endDate: Date, limit: number = 500) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(accessLogs).where(
    and(
      gte(accessLogs.createdAt, startDate),
      lte(accessLogs.createdAt, endDate)
    )
  ).orderBy(desc(accessLogs.createdAt)).limit(limit);
}

export async function getAccessLogStatistics(days: number = 7) {
  const db = await getDb();
  if (!db) return { totalAttempts: 0, successCount: 0, failedCount: 0, blockedCount: 0 };

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await db.select().from(accessLogs).where(gte(accessLogs.createdAt, startDate));
  
  return {
    totalAttempts: logs.length,
    successCount: logs.filter(l => l.status === 'success').length,
    failedCount: logs.filter(l => l.status === 'failed').length,
    blockedCount: logs.filter(l => l.status === 'blocked').length,
  };
}


// ===== PLANS =====

export async function createPlan(data: InsertPlan): Promise<Plan> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(plans).values(data);
  const newPlan = await db.select().from(plans).where(eq(plans.id, result[0].insertId as number)).limit(1);
  return newPlan[0]!;
}

export async function getPlanById(id: number): Promise<Plan | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
  return result[0];
}

export async function getAllPlans(): Promise<Plan[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(plans);
}

export async function updatePlan(id: number, data: Partial<Plan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(plans).set(data).where(eq(plans.id, id));
}

export async function deletePlan(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(plans).where(eq(plans.id, id));
}

// ===== RESELLER PLANS =====

export async function createResellerPlan(data: InsertResellerPlan): Promise<ResellerPlan> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(resellerPlans).values(data);
  const newResellerPlan = await db.select().from(resellerPlans).where(eq(resellerPlans.id, result[0].insertId as number)).limit(1);
  return newResellerPlan[0]!;
}

export async function getResellerPlanByResellerId(resellerId: number): Promise<ResellerPlan | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(resellerPlans).where(eq(resellerPlans.resellerId, resellerId)).limit(1);
  return result[0];
}

export async function getResellerPlanWithDetails(resellerId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(resellerPlans).where(eq(resellerPlans.resellerId, resellerId)).limit(1);
  if (!result[0]) return undefined;

  const plan = await db.select().from(plans).where(eq(plans.id, result[0].planId)).limit(1);
  return { resellerPlan: result[0], plan: plan[0] };
}

export async function updateResellerPlan(resellerId: number, data: Partial<ResellerPlan>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(resellerPlans).set(data).where(eq(resellerPlans.resellerId, resellerId));
}

export async function deleteResellerPlan(resellerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(resellerPlans).where(eq(resellerPlans.resellerId, resellerId));
}


// ===== APP CODES =====

export async function createAppCode(data: InsertAppCode): Promise<AppCode> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(appCodes).values(data);
  const newCode = await db.select().from(appCodes).where(eq(appCodes.id, result[0].insertId as number)).limit(1);
  return newCode[0]!;
}

export async function getAppCodeByCode(code: string): Promise<AppCode | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(appCodes).where(eq(appCodes.code, code)).limit(1);
  return result[0];
}

export async function getAppCodesByResellerId(resellerId: number): Promise<AppCode[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(appCodes).where(eq(appCodes.resellerId, resellerId));
}

export async function getAppCodesByApplicationId(applicationId: number): Promise<AppCode[]> {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(appCodes).where(eq(appCodes.applicationId, applicationId));
}

export async function updateAppCode(id: number, data: Partial<AppCode>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(appCodes).set(data).where(eq(appCodes.id, id));
}

export async function deleteAppCode(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(appCodes).where(eq(appCodes.id, id));
}


// ===== DELETE QUERIES =====

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(users).where(eq(users.id, id));
  cache.delete(`user_${id}`);
}

export async function deleteReseller(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete related data
  await db.delete(creditTransactions).where(eq(creditTransactions.resellerId, id));
  await db.delete(activationCodes).where(eq(activationCodes.resellerId, id));
  await db.delete(resellerPlans).where(eq(resellerPlans.resellerId, id));
  
  // Delete reseller
  await db.delete(resellers).where(eq(resellers.id, id));
  cache.delete(`reseller_${id}`);
}

export async function deleteCustomer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete related subscriptions and devices
  const subs = await db.select().from(subscriptions).where(eq(subscriptions.customerId, id));
  for (const sub of subs) {
    await db.delete(devices).where(eq(devices.subscriptionId, sub.id));
  }
  await db.delete(subscriptions).where(eq(subscriptions.customerId, id));
  
  // Delete customer
  await db.delete(customers).where(eq(customers.id, id));
  cache.delete(`customer_${id}`);
}
