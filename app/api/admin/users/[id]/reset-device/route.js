import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

export const POST = withAdmin(async (request, { params, user: admin }) => {
  const id = Number(params.id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Invalid id." }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id },
    data: { 
      status: "ACTIVE", 
      deviceHash: null, 
      deviceFailedAttempts: 0 
    }
  }).catch(() => null);

  if (!updated) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // Clear any existing sessions so the user is logged out of old devices
  await prisma.session.deleteMany({
    where: { userId: id }
  }).catch(() => null);

  await writeAuditLog({ actorId: admin.id, event: `User device binding and sessions reset: ${updated.email}`, level: "info" });
  return NextResponse.json({ ok: true });
});
