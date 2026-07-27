import crypto from "crypto";
import { cookies, headers } from "next/headers";
import { prisma } from "./db";

export const SESSION_COOKIE = "trackr_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function createSession(userId, { ip, userAgent } = {}) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { id: token, userId, ip, userAgent, expiresAt } });
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

  const session = await prisma.session.findUnique({
    where: { id: token },
    include: { user: { select: SAFE_USER_FIELDS } },
  });

  if (!session) return null;

  if (session.expiresAt < new Date() || session.user.status === "FROZEN") {
    await prisma.session.delete({ where: { id: token } }).catch(() => {});
    return null;
  }

  return session.user;
}
