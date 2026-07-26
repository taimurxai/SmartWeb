import { NextResponse } from "next/server";
import { withAuth } from "@/lib/rbac";
import { destroySession } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

export const POST = withAuth(async (request, { user }) => {
  await destroySession();
  await writeAuditLog({ actorId: user.id, event: "লগ-আউট করেছেন", level: "info" });
  return NextResponse.json({ ok: true });
});
