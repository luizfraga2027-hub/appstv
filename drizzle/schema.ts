import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Users table - JWT local authentication (no OAuth, no email)
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["admin", "reseller", "customer"]).default("customer").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "blocked"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Resellers table - Revendedores que distribuem códigos de ativação
 */
export const resellers = mysqlTable("resellers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  taxId: varchar("taxId", { length: 64 }),
  creditBalance: decimal("creditBalance", { precision: 12, scale: 2 }).default("0").notNull(),
  totalCreditsUsed: decimal("totalCreditsUsed", { precision: 12, scale: 2 }).default("0").notNull(),
  iptvListUrl: text("iptvListUrl"),
  codePrice: decimal("codePrice", { precision: 10, scale: 2 }).default("0").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Reseller = typeof resellers.$inferSelect;
export type InsertReseller = typeof resellers.$inferInsert;

/**
 * Credit transactions - Histórico de compra e distribuição de créditos
 */
export const creditTransactions = mysqlTable("creditTransactions", {
  id: int("id").autoincrement().primaryKey(),
  resellerId: int("resellerId").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  type: mysqlEnum("type", ["purchase", "distribution", "refund"]).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type InsertCreditTransaction = typeof creditTransactions.$inferInsert;

/**
 * Activation codes - Códigos de ativação para clientes
 */
export const activationCodes = mysqlTable("activationCodes", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  resellerId: int("resellerId").notNull(),
  customerId: int("customerId"),
  status: mysqlEnum("status", ["available", "activated", "expired"]).default("available").notNull(),
  durationDays: int("durationDays").notNull(), // 30, 90, 180, 365
  expirationDate: timestamp("expirationDate").notNull(),
  activatedAt: timestamp("activatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivationCode = typeof activationCodes.$inferSelect;
export type InsertActivationCode = typeof activationCodes.$inferInsert;

/**
 * Subscriptions - Assinaturas de clientes
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  activationCodeId: int("activationCodeId").notNull(),
  status: mysqlEnum("status", ["active", "expired", "cancelled"]).default("active").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  expirationDate: timestamp("expirationDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Customers - Clientes vinculados a revendedores
 */
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  resellerId: int("resellerId").notNull(),
  iptvListUrl: text("iptvListUrl"),
  status: mysqlEnum("status", ["active", "inactive", "blocked"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = typeof customers.$inferInsert;

/**
 * Devices - Dispositivos registrados para uma assinatura
 */
export const devices = mysqlTable("devices", {
  id: int("id").autoincrement().primaryKey(),
  subscriptionId: int("subscriptionId").notNull(),
  deviceId: varchar("deviceId", { length: 255 }).notNull().unique(),
  deviceName: varchar("deviceName", { length: 255 }).notNull(),
  lastAccessAt: timestamp("lastAccessAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Device = typeof devices.$inferSelect;
export type InsertDevice = typeof devices.$inferInsert;

/**
 * Relations for type safety
 */
export const usersRelations = relations(users, ({ one, many }) => ({
  reseller: one(resellers, {
    fields: [users.id],
    references: [resellers.userId],
  }),
}));

export const resellersRelations = relations(resellers, ({ one, many }) => ({
  user: one(users, {
    fields: [resellers.userId],
    references: [users.id],
  }),
  creditTransactions: many(creditTransactions),
  activationCodes: many(activationCodes),
}));

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  reseller: one(resellers, {
    fields: [creditTransactions.resellerId],
    references: [resellers.id],
  }),
}));

export const activationCodesRelations = relations(activationCodes, ({ one, many }) => ({
  reseller: one(resellers, {
    fields: [activationCodes.resellerId],
    references: [resellers.id],
  }),
  customer: one(users, {
    fields: [activationCodes.customerId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [activationCodes.id],
    references: [subscriptions.activationCodeId],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  customer: one(users, {
    fields: [subscriptions.customerId],
    references: [users.id],
  }),
  activationCode: one(activationCodes, {
    fields: [subscriptions.activationCodeId],
    references: [activationCodes.id],
  }),
  devices: many(devices),
}));

export const devicesRelations = relations(devices, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [devices.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const customersRelations = relations(customers, ({ one }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  reseller: one(resellers, {
    fields: [customers.resellerId],
    references: [resellers.id],
  }),
}));