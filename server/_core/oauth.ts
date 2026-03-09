import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { hashPassword, createToken } from "../auth";
import { z } from "zod";

/**
 * JWT local auth routes - no OAuth
 */
export function registerOAuthRoutes(app: Express) {
  // Register endpoint
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        username: z.string().min(3).max(64),
        password: z.string().min(6),
        name: z.string().min(1).max(255),
        role: z.enum(["reseller", "customer"]).default("customer"),
      });

      const body = schema.parse(req.body);

      // Check if username already exists
      const existingUser = await db.getUserByUsername(body.username);
      if (existingUser) {
        res.status(400).json({ error: "Username already exists" });
        return;
      }

      // Hash password and create user
      const passwordHash = await hashPassword(body.password);
      const user = await db.createUser({
        username: body.username,
        passwordHash,
        name: body.name,
        role: body.role,
        status: "active",
      });

      // If registering as reseller, create reseller profile
      if (body.role === "reseller") {
        await db.createReseller({
          userId: user.id,
          companyName: body.name,
          creditBalance: "0",
          totalCreditsUsed: "0",
          status: "active",
        });
      }

      // Create JWT token
      const token = await createToken(user);

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      console.error("[Auth] Register failed:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login endpoint
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        username: z.string(),
        password: z.string(),
      });

      const body = schema.parse(req.body);

      // Find user by username
      const user = await db.getUserByUsername(body.username);
      if (!user) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Check if user is active
      if (user.status !== "active") {
        res.status(403).json({ error: "User account is not active" });
        return;
      }

      // Verify password
      const { verifyPassword } = await import("../auth");
      const isValid = await verifyPassword(body.password, user.passwordHash);
      if (!isValid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      // Create JWT token
      const token = await createToken(user);

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}
