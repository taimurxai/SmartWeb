import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { prisma } from "./db";

import { redis } from "./redis";

export const SESSION_COOKIE = "trackr_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const CACHE_TTL_SEC = 60; // 60 seconds cache for instant-ish freezing

export async function createSession(userId, { ip, userAgent } = {}) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { id: token, userId, ip, userAgent, expiresAt } });
  
  if (redis) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: SAFE_USER_FIELDS });
    if (user) {
      await redis.setex(`session:${token}`, CACHE_TTL_SEC, JSON.stringify(user)).catch(() => {});
    }
  }

  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

export async function destroySession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { id: token } }).catch(() => {});
    if (redis) await redis.del(`session:${token}`).catch(() => {});
  }
  cookies().delete(SESSION_COOKIE);
}

export const SAFE_USER_FIELDS = { id: true, name: true, email: true, role: true, status: true, deviceHash: true, createdAt: true };

export function toSafeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    deviceHash: user.deviceHash,
    createdAt: user.createdAt,
  };
}

// Re-validated against the DB on every call (not cached in a JWT payload) so
// freezing a user or deleting their session takes effect on their very next
// request, not just their next login.
export async function getSessionUser() {
  const reqHeaders = headers();
  const authHeader = reqHeaders.get("authorization");
  let token = cookies().get(SESSION_COOKIE)?.value;
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) return null;

  if (redis) {
    try {
      const cached = await redis.get(`session:${token}`);
      if (cached) {
        const user = JSON.parse(cached);
        if (user.status === "FROZEN") {
           await destroySession();
           return null;
        }
        return user;
      }
    } catch (error) {
      // Ignore cache errors and fallback to DB
    }
  }

  const session = await prisma.session.findUnique({
    where: { id: token },
    include: { user: { select: SAFE_USER_FIELDS } },
  });

  if (!session) return null;

  if (session.expiresAt < new Date() || session.user.status === "FROZEN") {
    await prisma.session.delete({ where: { id: token } }).catch(() => {});
    if (redis) await redis.del(`session:${token}`).catch(() => {});
    return null;
  }

  if (redis) {
    await redis.setex(`session:${token}`, CACHE_TTL_SEC, JSON.stringify(session.user)).catch(() => {});
  }

  return session.user;
}
