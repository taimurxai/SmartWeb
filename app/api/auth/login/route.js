import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, toSafeUser } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rateLimit";
import { writeAuditLog } from "@/lib/audit";
import { parseUserAgent, getClientIp } from "@/lib/device";
import { originIsTrusted } from "@/lib/rbac";

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request) {
  if (!originIsTrusted(request)) {
    return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
  }

  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") || "";
  const { os, browser } = parseUserAgent(userAgent);

  let body;
  try {
    body = loginSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid email or password format." }, { status: 400 });
  }

  const email = body.email.toLowerCase();

  const ipLimit = checkRateLimit(`login:ip:${ip}`, { max: LOGIN_MAX_ATTEMPTS * 4, windowMs: LOGIN_WINDOW_MS });
  const emailLimit = checkRateLimit(`login:email:${ip}:${email}`, {
    max: LOGIN_MAX_ATTEMPTS,
    windowMs: LOGIN_WINDOW_MS,
  });
  if (!ipLimit.allowed || !emailLimit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });

  async function logAttempt(userId, success) {
    if (!userId) return;
    await prisma.loginEvent.create({ data: { userId, ip, os, browser, success } }).catch(() => {});
  }

  if (!user || !(await bcrypt.compare(body.password, user.password))) {
    await logAttempt(user?.id, false);
    await writeAuditLog({ actorId: user?.id ?? null, event: `Failed login for ${email}`, level: "error" });
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  if (user.status === "FROZEN") {
    await logAttempt(user.id, false);
    await writeAuditLog({ actorId: user.id, event: "Login blocked: account frozen", level: "error" });
    return NextResponse.json(
      { error: "Account frozen. Please contact administration.", code: "FROZEN" },
      { status: 403 }
    );
  }

  const token = await createSession(user.id, { ip, userAgent });
  await logAttempt(user.id, true);
  await writeAuditLog({ actorId: user.id, event: "User logged in", level: "info" });

  return NextResponse.json({ user: toSafeUser(user), token });
}
