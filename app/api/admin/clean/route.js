import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";

export const POST = withAdmin(async (request, ctx) => {
  try {
    const { cleanLogins, cleanTracking, cleanAuditLogs } = await request.json();

    if (cleanLogins) {
      await prisma.loginEvent.deleteMany({});
    }

    if (cleanTracking) {
      // Clear all tracking submissions and tracking codes
      await prisma.trackingSubmission.deleteMany({});
      await prisma.trackingCode.deleteMany({});
    }

    if (cleanAuditLogs) {
      // Note: We might want to keep the current action in the audit log, 
      // so we delete everything before right now.
      const now = new Date();
      await prisma.auditLog.deleteMany({
        where: { createdAt: { lt: now } }
      });
    }

    await writeAuditLog({
      actorId: ctx.user.id,
      event: `Admin performed data cleanup: ${[
        cleanLogins && "Logins",
        cleanTracking && "Tracking Data",
        cleanAuditLogs && "Audit Logs"
      ].filter(Boolean).join(", ")}`,
      level: "info"
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to clean data:", err);
    return NextResponse.json({ error: "Failed to clean data." }, { status: 500 });
  }
});
