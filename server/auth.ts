import { hash, compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { User } from "../drizzle/schema";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production");
const JWT_EXPIRY = "7d";

/**
 * Hash a password using bcryptjs
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

/**
 * Compare a password with its hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}

/**
 * Create a JWT token for a user
 */
export async function createToken(user: User): Promise<string> {
  const token = await new SignJWT({
    id: user.id,
    username: user.username,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<{ id: number; username: string; role: string } | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { id: number; username: string; role: string };
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    return null;
  }
}

/**
 * Extract user from token payload
 */
export function extractUserFromToken(payload: any): User | null {
  if (!payload || !payload.id) {
    return null;
  }

  return {
    id: payload.id,
    username: payload.username,
    role: payload.role as "admin" | "reseller" | "customer",
    passwordHash: "", // Not included in token
    name: "", // Not included in token
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
