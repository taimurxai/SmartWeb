import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withAdmin } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";

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

  if (!updated) return NextResponse.json({ error: "ইউজার পাওয়া যায়নি।" }, { status: 404 });

  await writeAuditLog({ actorId: admin.id, event: `User device binding reset: ${updated.email}`, level: "info" });
  return NextResponse.json({ ok: true });
});
