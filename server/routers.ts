import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createToken, hashPassword, verifyPassword } from "./auth";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { nanoid } from "nanoid";

// ===== HELPER PROCEDURES =====

const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

const resellerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "reseller" && ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Reseller access required" });
  }
  return next({ ctx });
});

// ===== AUTH ROUTER =====

const authRouter = router({
  me: publicProcedure.query(({ ctx }) => ctx.user || null),

  register: publicProcedure
    .input(
      z.object({
        username: z.string().min(3).max(64),
        password: z.string().min(6),
        name: z.string().min(1).max(255),
        role: z.enum(["reseller", "customer"]).default("customer"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const existingUser = await db.getUserByUsername(input.username);
      if (existingUser) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Username already exists" });
      }

      const passwordHash = await hashPassword(input.password);
      const user = await db.createUser({
        username: input.username,
        passwordHash,
        name: input.name,
        role: input.role,
        status: "active",
      });

      if (input.role === "reseller") {
        await db.createReseller({
          userId: user.id,
          companyName: input.name,
          creditBalance: "0",
          totalCreditsUsed: "0",
          status: "active",
        });
      }

      const token = await createToken(user);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return { success: true, user: { id: user.id, username: user.username, role: user.role } };
    }),

  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await db.getUserByUsername(input.username);
      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }

      if (user.status !== "active") {
        throw new TRPCError({ code: "FORBIDDEN", message: "User account is not active" });
      }

      const isValid = await verifyPassword(input.password, user.passwordHash);
      if (!isValid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }

      const token = await createToken(user);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return { success: true, user: { id: user.id, username: user.username, role: user.role } };
    }),

  logout: protectedProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true };
  }),
});

// ===== RESELLER ROUTER =====

const resellerRouter = router({
  getProfile: resellerProcedure.query(async ({ ctx }) => {
    const reseller = await db.getResellerByUserId(ctx.user!.id);
    if (!reseller) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Reseller profile not found" });
    }
    return reseller;
  }),

  getCredits: resellerProcedure.query(async ({ ctx }) => {
    const reseller = await db.getResellerByUserId(ctx.user!.id);
    if (!reseller) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Reseller profile not found" });
    }
    return { creditBalance: reseller.creditBalance, totalCreditsUsed: reseller.totalCreditsUsed };
  }),

  getTransactions: resellerProcedure.query(async ({ ctx }) => {
    const reseller = await db.getResellerByUserId(ctx.user!.id);
    if (!reseller) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Reseller profile not found" });
    }
    return db.getCreditTransactionsByResellerId(reseller.id);
  }),

  generateCodes: resellerProcedure
    .input(
      z.object({
        quantity: z.number().min(1).max(100),
        durationDays: z.enum(["30", "90", "180", "365"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const reseller = await db.getResellerByUserId(ctx.user!.id);
      if (!reseller) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reseller profile not found" });
      }

      const durationDays = parseInt(input.durationDays);
      const codes = [];

      for (let i = 0; i < input.quantity; i++) {
        const code = nanoid(16).toUpperCase();
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 365); // Code valid for 1 year

        const activationCode = await db.createActivationCode({
          code,
          resellerId: reseller.id,
          customerId: null,
          status: "available",
          durationDays,
          expirationDate,
          activatedAt: null,
        });

        codes.push(activationCode);
      }

      return codes;
    }),

  listCodes: resellerProcedure.query(async ({ ctx }) => {
    const reseller = await db.getResellerByUserId(ctx.user!.id);
    if (!reseller) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Reseller profile not found" });
    }
    return db.getActivationCodesByResellerId(reseller.id);
  }),
});

// ===== CUSTOMER ROUTER =====

const customerRouter = router({
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    return db.getSubscriptionsByCustomerId(ctx.user!.id);
  }),

  getActiveSubscription: protectedProcedure.query(async ({ ctx }) => {
    return db.getActiveSubscriptionByCustomerId(ctx.user!.id);
  }),

  activateCode: protectedProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const activationCode = await db.getActivationCodeByCode(input.code);

      if (!activationCode) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Code not found" });
      }

      if (activationCode.status !== "available") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Code is not available" });
      }

      if (new Date() > activationCode.expirationDate) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Code has expired" });
      }

      // Create subscription
      const startDate = new Date();
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + activationCode.durationDays);

      const subscription = await db.createSubscription({
        customerId: ctx.user!.id,
        activationCodeId: activationCode.id,
        status: "active",
        startDate,
        expirationDate,
      });

      // Update code status
      await db.updateActivationCodeStatus(activationCode.id, "activated", ctx.user!.id);

      return subscription;
    }),

  registerDevice: protectedProcedure
    .input(
      z.object({
        deviceId: z.string(),
        deviceName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const subscription = await db.getActiveSubscriptionByCustomerId(ctx.user!.id);

      if (!subscription) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No active subscription" });
      }

      return db.createDevice({
        subscriptionId: subscription.id,
        deviceId: input.deviceId,
        deviceName: input.deviceName,
        lastAccessAt: new Date(),
      });
    }),

  getDevices: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await db.getActiveSubscriptionByCustomerId(ctx.user!.id);

    if (!subscription) {
      return [];
    }

    return db.getDevicesBySubscriptionId(subscription.id);
  }),
});

// ===== ADMIN ROUTER =====

const adminRouter = router({
  getAllUsers: adminProcedure.query(async () => {
    return db.getAllUsers();
  }),

  getAllResellers: adminProcedure.query(async () => {
    return db.getAllResellers();
  }),

  addCreditsToReseller: adminProcedure
    .input(
      z.object({
        resellerId: z.number(),
        amount: z.number().positive(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const reseller = await db.getResellerById(input.resellerId);

      if (!reseller) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Reseller not found" });
      }

      await db.updateResellerCredits(input.resellerId, input.amount);

      await db.createCreditTransaction({
        resellerId: input.resellerId,
        amount: input.amount.toString(),
        type: "purchase",
        description: input.description || "Admin credit addition",
      });

      return { success: true };
    }),

  blockUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      await db.updateUserStatus(input.userId, "blocked");
      return { success: true };
    }),

  unblockUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      await db.updateUserStatus(input.userId, "active");
      return { success: true };
    }),

  getStatistics: adminProcedure.query(async () => {
    const users = await db.getAllUsers();
    const resellers = await db.getAllResellers();

    const totalUsers = users.length;
    const totalResellers = resellers.length;
    const totalCustomers = users.filter((u) => u.role === "customer").length;
    const totalCredits = resellers.reduce((sum, r) => sum + parseFloat(r.creditBalance.toString()), 0);

    return {
      totalUsers,
      totalResellers,
      totalCustomers,
      totalCredits,
    };
  }),
});

// ===== SMART TV API ROUTER =====

const smartTvRouter = router({
  validateCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const activationCode = await db.getActivationCodeByCode(input.code);

      if (!activationCode) {
        return { valid: false, message: "Code not found" };
      }

      if (activationCode.status !== "available") {
        return { valid: false, message: "Code is not available" };
      }

      if (new Date() > activationCode.expirationDate) {
        return { valid: false, message: "Code has expired" };
      }

      return { valid: true, durationDays: activationCode.durationDays };
    }),

  checkSubscription: publicProcedure
    .input(z.object({ deviceId: z.string() }))
    .query(async ({ input }) => {
      // Find device and check subscription status
      // This is a simplified version - in production you'd need to query devices table
      return { active: false, message: "Device not found" };
    }),
});

// ===== MAIN ROUTER =====

export const appRouter = router({
  auth: authRouter,
  reseller: resellerRouter,
  customer: customerRouter,
  admin: adminRouter,
  smartTv: smartTvRouter,
});

export type AppRouter = typeof appRouter;
