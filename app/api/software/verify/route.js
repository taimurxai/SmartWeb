import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.status === "FROZEN") {
    return NextResponse.json({ error: "Account Frozen" }, { status: 403 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch (e) {}

  const incomingHash = body.deviceHash;
  if (!incomingHash) {
    return NextResponse.json({ error: "Device fingerprint required for verification." }, { status: 400 });
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
      await writeAuditLog({ actorId: user.id, event: "Account frozen due to 3 failed device verifications", level: "error" });
      
      return NextResponse.json({ error: "Account Frozen due to multiple failed device checks." }, { status: 403 });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { deviceFailedAttempts: attempts }
      });
      await writeAuditLog({ actorId: user.id, event: `Failed device verification (attempt ${attempts}/3)`, level: "warn" });
      
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
