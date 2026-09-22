import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/device";

const VERIFY_MAX_ATTEMPTS = 5;
const VERIFY_WINDOW_MS = 15 * 60 * 1000;

export const dynamic = "force-dynamic";

export async function POST(request) {
  const ip = getClientIp(request);
  const ipLimit = await checkRateLimit(`device-verify:ip:${ip}`, {
    max: VERIFY_MAX_ATTEMPTS * 2,
    windowMs: VERIFY_WINDOW_MS,
  });

  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "Too many verification attempts from this IP. Please try again later." },
      { status: 429 }
    );
  }

  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.status === "FROZEN") {
    return NextResponse.json({ error: "Account Frozen. Contact administration." }, { status: 403 });
  }

  const userLimit = await checkRateLimit(`device-verify:user:${user.id}`, {
    max: VERIFY_MAX_ATTEMPTS,
    windowMs: VERIFY_WINDOW_MS,
  });

  if (!userLimit.allowed) {
    return NextResponse.json(
      { error: "Too many verification attempts for this account. Please wait before retrying." },
      { status: 429 }
    );
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const incomingHash = typeof body.deviceHash === "string" ? body.deviceHash.trim() : null;
  if (!incomingHash || incomingHash.length < 8 || incomingHash.length > 256) {
    return NextResponse.json({ error: "Valid device fingerprint required for verification." }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  
  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!dbUser.deviceHash) {
    await prisma.user.update({
      where: { id: user.id },
      data: { deviceHash: incomingHash, deviceFailedAttempts: 0 }
    });
    await writeAuditLog({ actorId: user.id, event: "Device bound successfully on first login", level: "info" });
  } else if (dbUser.deviceHash !== incomingHash) {
    const attempts = dbUser.deviceFailedAttempts + 1;
    if (attempts >= 3) {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: "FROZEN", deviceFailedAttempts: attempts }
      });
      await prisma.session.deleteMany({ where: { userId: user.id } }).catch(() => {});
      await writeAuditLog({
        actorId: user.id,
        event: "Account frozen due to 3 failed device verifications",
        level: "error",
      });
      
      return NextResponse.json({ error: "Account Frozen due to multiple failed device checks." }, { status: 403 });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { deviceFailedAttempts: attempts }
      });
      await writeAuditLog({
        actorId: user.id,
        event: `Failed device verification (attempt ${attempts}/3)`,
        level: "warn",
      });
      
      return NextResponse.json({ error: `Unrecognized device. Attempt ${attempts} of 3.` }, { status: 403 });
    }
  } else {
    if (dbUser.deviceFailedAttempts > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { deviceFailedAttempts: 0 }
      });
    }
  }

  return NextResponse.json({ 
    status: "Verified", 
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  });
}
